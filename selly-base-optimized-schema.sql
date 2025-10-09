-- =========================================================
-- SELLY BASE - OPTIMIZED DATABASE SCHEMA v2.1
-- =========================================================
-- Partitioning, sample data bugfixes, and all previous issues resolved
-- =========================================================

BEGIN;

-- Extensions for advanced functionality
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; 
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- UTILITY FUNCTIONS
-- =========================================================

CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_search_vector(company_name TEXT, description TEXT DEFAULT '')
RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english', COALESCE(company_name, '') || ' ' || COALESCE(description, ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================================
-- CORE MULTI-TENANT ARCHITECTURE
-- =========================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, role_id, organization_id)
);

-- =========================================================
-- REFERENCE DATA (must be created before companies)
-- =========================================================

CREATE TABLE ref_industry_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_th TEXT,
  description TEXT,
  classification_system TEXT NOT NULL,
  level INTEGER NOT NULL,
  parent_id UUID REFERENCES ref_industry_codes(id),
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, classification_system)
);

CREATE TABLE ref_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_th TEXT,
  region_type TEXT NOT NULL CHECK (region_type IN ('country', 'province', 'district', 'subdistrict')),
  country_code TEXT NOT NULL,
  parent_region_id UUID REFERENCES ref_regions(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, country_code, region_type)
);

CREATE TABLE ref_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  category TEXT,
  parent_tag_id UUID REFERENCES ref_tags(id),
  is_system_tag BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- CANONICAL COMPANY DATA
-- =========================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant scoping: NULL for shared reference data, UUID for customer-specific data
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name_en TEXT NOT NULL,
  name_th TEXT,
  name_local TEXT,
  display_name TEXT GENERATED ALWAYS AS (COALESCE(name_en, name_th)) STORED,
  primary_registration_no TEXT,
  registration_country_code TEXT DEFAULT 'TH',
  duns_number TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  postal_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  business_description TEXT,
  established_date DATE,
  employee_count_estimate INTEGER,
  company_size TEXT CHECK (company_size IN ('micro', 'small', 'medium', 'large', 'enterprise')),
  annual_revenue_estimate DECIMAL(15,2),
  currency_code TEXT DEFAULT 'THB',
  website_url TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  logo_url TEXT,
  
  -- Foreign key references to reference data tables
  primary_industry_id UUID REFERENCES ref_industry_codes(id) ON DELETE SET NULL,
  primary_region_id UUID REFERENCES ref_regions(id) ON DELETE SET NULL,
  
  search_vector tsvector GENERATED ALWAYS AS (
    generate_search_vector(name_en, business_description)
  ) STORED,
  embedding_vector VECTOR(768),
  data_quality_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- SaaS-aware data sourcing and privacy
  data_source TEXT NOT NULL DEFAULT 'customer_input' CHECK (
    data_source IN ('albaly_list', 'dbd_registry', 'customer_input', 'data_enrichment', 'third_party')
  ),
  source_reference TEXT, -- Reference to original source (e.g., "DBD-2024-Q1", "Albaly-Tech-Companies")
  is_shared_data BOOLEAN DEFAULT false, -- True for Albaly/DBD data, False for customer-specific
  data_sensitivity TEXT DEFAULT 'standard' CHECK (
    data_sensitivity IN ('public', 'standard', 'confidential', 'restricted')
  ),
  
  last_enriched_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'unverified' CHECK (
    verification_status IN ('verified', 'unverified', 'disputed', 'inactive')
  ),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  ),
  -- Shared data (Albaly/DBD) should not belong to specific organization
  CONSTRAINT valid_shared_data_scope CHECK (
    (is_shared_data = true AND organization_id IS NULL) OR 
    (is_shared_data = false AND organization_id IS NOT NULL)
  )
);

-- Company-Tag many-to-many relationship
CREATE TABLE company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES ref_tags(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, tag_id)
);

CREATE TABLE company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_no TEXT NOT NULL,
  registration_type TEXT NOT NULL,
  authority_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved', 'suspended')),
  registered_date DATE,
  dissolved_date DATE,
  is_primary BOOLEAN DEFAULT false,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(registration_no, authority_code)
);

CREATE TABLE company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    TRIM(BOTH FROM COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
  ) STORED,
  title TEXT,
  department TEXT,
  seniority_level TEXT CHECK (seniority_level IN ('ic', 'manager', 'director', 'vp', 'c_level', 'founder')),
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  last_verified_at TIMESTAMPTZ,
  verification_method TEXT,
  is_opted_out BOOLEAN DEFAULT false,
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- COMPANY LISTS & LEAD MANAGEMENT  
-- =========================================================

CREATE TABLE company_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'organization', 'public')),
  is_shared BOOLEAN DEFAULT false,
  total_companies INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_smart_list BOOLEAN DEFAULT false,
  smart_criteria JSONB DEFAULT '{}',
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES company_lists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  note TEXT,
  position INTEGER,
  custom_fields JSONB DEFAULT '{}',
  lead_score DECIMAL(5,2) DEFAULT 0.0,
  score_breakdown JSONB DEFAULT '{}',
  score_calculated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  status_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(list_id, company_id)
);

-- =========================================================
-- LEAD PROJECTS (Workflow Management)
-- =========================================================

CREATE TABLE lead_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pm_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_lead_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  target_company_count INTEGER,
  target_contact_count INTEGER,
  target_meetings INTEGER,
  target_revenue DECIMAL(15,2),
  actual_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_project_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_method TEXT CHECK (source_method IN ('albaly_list', 'dbd_import', 'customer_manual', 'smart_list', 'api_integration')),
  source_list_id UUID REFERENCES company_lists(id) ON DELETE SET NULL,
  source_description TEXT, -- E.g., "From Albaly Tech Companies List", "Customer manual entry"
  priority_score DECIMAL(5,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'contacted', 'qualified', 'converted', 'rejected')),
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, company_id)
);

CREATE TABLE lead_project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('research', 'outreach', 'followup', 'demo', 'proposal')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- AUDIT & LOGGING
-- =========================================================

-- Application-level audit logs (matches TypeORM AuditLog entity)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SEARCH', 'EXPORT', 'IMPORT')),
  resource_type TEXT,
  resource_path TEXT,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,
  status_code INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DATA EXPORT & IMPORT MANAGEMENT
-- =========================================================

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
  scope TEXT,
  format TEXT NOT NULL DEFAULT 'CSV' CHECK (format IN ('CSV', 'Excel', 'JSON')),
  total_records INTEGER DEFAULT 0,
  file_size TEXT,
  download_url TEXT,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'validating')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  valid_records INTEGER DEFAULT 0,
  error_records INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PERFORMANCE OPTIMIZATION
-- =========================================================

CREATE MATERIALIZED VIEW mv_company_search AS
SELECT 
  c.id,
  c.organization_id,
  c.name_en,
  c.name_th,
  c.display_name,
  c.primary_registration_no,
  c.registration_country_code,
  c.business_description,
  c.website_url,
  c.company_size,
  c.verification_status,
  c.data_quality_score,
  c.data_source,
  c.source_reference,
  c.is_shared_data,
  c.data_sensitivity,
  c.search_vector,
  c.primary_industry_id,
  c.primary_region_id,
  COALESCE(cc.contact_count, 0) as contact_count,
  pr.registration_no as primary_registration_no_full,
  pr.authority_code,
  COALESCE(lm.list_count, 0) as list_membership_count,
  c.updated_at
FROM companies c
LEFT JOIN (
  SELECT company_id, COUNT(*) as contact_count
  FROM company_contacts 
  WHERE is_opted_out = false
  GROUP BY company_id
) cc ON c.id = cc.company_id
LEFT JOIN (
  SELECT company_id, registration_no, authority_code
  FROM company_registrations 
  WHERE is_primary = true
) pr ON c.id = pr.company_id
LEFT JOIN (
  SELECT company_id, COUNT(*) as list_count
  FROM company_list_items
  GROUP BY company_id
) lm ON c.id = lm.company_id;

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================

CREATE INDEX idx_users_organization_email ON users(organization_id, email);
CREATE INDEX idx_users_organization_status ON users(organization_id, status);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE last_login_at IS NOT NULL;

-- Companies (Multi-tenant and source-aware indexes)
CREATE INDEX idx_companies_organization ON companies(organization_id);
CREATE INDEX idx_companies_org_source ON companies(organization_id, data_source);
CREATE INDEX idx_companies_shared_data ON companies(is_shared_data) WHERE is_shared_data = true;
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name_en gin_trgm_ops);
CREATE INDEX idx_companies_search_vector ON companies USING gin(search_vector);
CREATE INDEX idx_companies_size ON companies(company_size) WHERE company_size IS NOT NULL;
CREATE INDEX idx_companies_verification ON companies(verification_status);
CREATE INDEX idx_companies_registration_no ON companies(primary_registration_no) WHERE primary_registration_no IS NOT NULL;
CREATE INDEX idx_companies_primary_industry ON companies(primary_industry_id) WHERE primary_industry_id IS NOT NULL;
CREATE INDEX idx_companies_primary_region ON companies(primary_region_id) WHERE primary_region_id IS NOT NULL;
CREATE INDEX idx_company_tags_company ON company_tags(company_id);
CREATE INDEX idx_company_tags_tag ON company_tags(tag_id);
CREATE INDEX idx_company_lists_org_owner ON company_lists(organization_id, owner_user_id);
CREATE INDEX idx_company_lists_visibility ON company_lists(visibility);
CREATE INDEX idx_company_lists_smart ON company_lists(is_smart_list) WHERE is_smart_list = true;
CREATE INDEX idx_company_lists_activity ON company_lists(last_activity_at DESC);
CREATE INDEX idx_list_items_list_position ON company_list_items(list_id, position) WHERE position IS NOT NULL;
CREATE INDEX idx_list_items_company ON company_list_items(company_id);
CREATE INDEX idx_list_items_status ON company_list_items(status);
CREATE INDEX idx_list_items_score ON company_list_items(lead_score DESC) WHERE lead_score IS NOT NULL;
CREATE INDEX idx_lead_projects_org_status ON lead_projects(organization_id, status);
CREATE INDEX idx_lead_projects_owner ON lead_projects(owner_user_id);
CREATE INDEX idx_lead_projects_dates ON lead_projects(start_date, target_end_date);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type, created_at DESC);
CREATE INDEX idx_activity_user_type ON user_activity_logs(user_id, activity_type, created_at DESC);
CREATE INDEX idx_activity_org_type ON user_activity_logs(organization_id, activity_type, created_at DESC);
CREATE INDEX idx_contacts_company ON company_contacts(company_id);
CREATE INDEX idx_contacts_email ON company_contacts(email) WHERE email IS NOT NULL AND is_opted_out = false;

-- Export/Import job indexes
CREATE INDEX idx_export_jobs_org_status ON export_jobs(organization_id, status);
CREATE INDEX idx_export_jobs_requested_by ON export_jobs(requested_by);
CREATE INDEX idx_export_jobs_created_at ON export_jobs(created_at DESC);
CREATE INDEX idx_export_jobs_expires_at ON export_jobs(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_import_jobs_org_status ON import_jobs(organization_id, status);
CREATE INDEX idx_import_jobs_uploaded_by ON import_jobs(uploaded_by);
CREATE INDEX idx_import_jobs_created_at ON import_jobs(created_at DESC);

-- =========================================================
-- TRIGGERS
-- =========================================================

CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_company_lists_updated_at BEFORE UPDATE ON company_lists FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_lead_projects_updated_at BEFORE UPDATE ON lead_projects FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_export_jobs_updated_at BEFORE UPDATE ON export_jobs FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_import_jobs_updated_at BEFORE UPDATE ON import_jobs FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE OR REPLACE FUNCTION trigger_update_list_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE company_lists 
    SET total_companies = total_companies + 1, last_activity_at = CURRENT_TIMESTAMP
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE company_lists 
    SET total_companies = GREATEST(total_companies - 1, 0), last_activity_at = CURRENT_TIMESTAMP
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_company_list_items_count 
  AFTER INSERT OR DELETE ON company_list_items
  FOR EACH ROW EXECUTE FUNCTION trigger_update_list_counts();

-- =========================================================
-- SAMPLE DATA
-- =========================================================

INSERT INTO roles (name, description, is_system_role, permissions) VALUES
-- Platform roles
('platform_admin', 'Platform Administrator with full system access', true, ARRAY['*']),
('platform_staff', 'Platform staff with limited system access', true, ARRAY['platform:read', 'organizations:read', 'users:read']),
-- Multi-tenant customer roles (matching TypeScript migration)
('customer_admin', 'Organization administrator with full organization access', true, ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']),
('customer_staff', 'Organization staff with limited access', true, ARRAY['projects:*', 'lists:*', 'companies:read']),
('customer_user', 'Basic organization user', true, ARRAY['lists:create', 'lists:read:own', 'companies:read', 'contacts:read']),
-- Legacy roles for backward compatibility
('admin', 'Legacy admin role', true, ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']),
('staff', 'Legacy staff role', true, ARRAY['projects:*', 'lists:*', 'companies:read']),
('user', 'Legacy user role', true, ARRAY['lists:create', 'lists:read:own', 'companies:read']);

-- Organizations for multi-tenant testing
INSERT INTO organizations (id, name, slug, status, subscription_tier) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Albaly Digital', 'albaly', 'active', 'enterprise'),
('550e8400-e29b-41d4-a716-446655440001', 'Demo Customer Corp', 'demo-customer', 'active', 'professional'),
('550e8400-e29b-41d4-a716-446655440010', 'Sample Enterprise Ltd', 'sample-enterprise', 'active', 'enterprise');

-- Comprehensive test users covering all role scenarios
-- All test users have password: password123
-- Password hash generated using argon2id with verified working credentials
INSERT INTO users (id, organization_id, email, name, password_hash, status, email_verified_at) VALUES
-- Platform users (no specific organization)
('550e8400-e29b-41d4-a716-446655440001', NULL, 'platform@albaly.com', 'Platform Admin', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', NULL, 'support@albaly.com', 'Platform Staff', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
-- Albaly Digital organization users
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'admin@albaly.com', 'Albaly Admin', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'staff@albaly.com', 'Albaly Staff', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'user@albaly.com', 'Albaly User', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
-- Demo Customer Corp users  
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'admin@democustomer.com', 'Customer Admin', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'staff@democustomer.com', 'Customer Staff', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'user@democustomer.com', 'Customer User', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
-- Sample Enterprise users with legacy roles
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', 'admin@sampleenterprise.com', 'Legacy Admin', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'staff@sampleenterprise.com', 'Legacy Staff', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 'user@sampleenterprise.com', 'Legacy User', '$argon2id$v=19$m=65536,t=3,p=4$wBnQnuoyzqCdY6hsiB/j8Q$G/uEcoh8ys3r6PjGDh/sqISWOm1ThmnylSGLn4TmeaA', 'active', CURRENT_TIMESTAMP);

INSERT INTO ref_industry_codes (code, title_en, title_th, classification_system, level) VALUES
('46', 'Wholesale trade', 'ขายส่ง', 'TSIC_2009', 2),
('4610', 'Wholesale on a fee or contract basis', 'ขายส่งโดยคิดค่าจ้างหรือตามสัญญา', 'TSIC_2009', 4),
('62', 'Computer programming and information service activities', 'กิจกรรมการเขียนโปรแกรมคอมพิวเตอร์และบริการสารสนเทศ', 'TSIC_2009', 2);

INSERT INTO ref_regions (code, name_en, name_th, region_type, country_code) VALUES
('TH', 'Thailand', 'ประเทศไทย', 'country', 'TH'),
('TH-10', 'Bangkok', 'กรุงเทพมหานคร', 'province', 'TH'),
('TH-11', 'Samut Prakan', 'สมุทรปราการ', 'province', 'TH');

INSERT INTO ref_tags (key, name, description, category, color) VALUES
('saas', 'SaaS', 'Software as a Service companies', 'business_model', '#3b82f6'),
('enterprise', 'Enterprise', 'Large enterprise companies', 'size', '#059669'),
('startup', 'Startup', 'Early stage startup companies', 'stage', '#dc2626'),
('high_priority', 'High Priority', 'High priority prospect', 'priority', '#ea580c');

-- User role assignments - this is crucial for the app to work properly
-- Platform users get platform roles
INSERT INTO user_roles (user_id, role_id, organization_id, assigned_by, assigned_at) VALUES
-- Platform Admin
((SELECT id FROM users WHERE email = 'platform@albaly.com'), 
 (SELECT id FROM roles WHERE name = 'platform_admin'), 
 '550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM users WHERE email = 'platform@albaly.com'),
 CURRENT_TIMESTAMP),

-- Platform Staff  
((SELECT id FROM users WHERE email = 'support@albaly.com'), 
 (SELECT id FROM roles WHERE name = 'platform_staff'), 
 '550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM users WHERE email = 'platform@albaly.com'),
 CURRENT_TIMESTAMP),

-- Albaly Digital organization role assignments
((SELECT id FROM users WHERE email = 'admin@albaly.com'), 
 (SELECT id FROM roles WHERE name = 'customer_admin'), 
 '550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM users WHERE email = 'platform@albaly.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'staff@albaly.com'), 
 (SELECT id FROM roles WHERE name = 'customer_staff'), 
 '550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM users WHERE email = 'admin@albaly.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'user@albaly.com'), 
 (SELECT id FROM roles WHERE name = 'customer_user'), 
 '550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM users WHERE email = 'admin@albaly.com'),
 CURRENT_TIMESTAMP),

-- Demo Customer Corp organization role assignments
((SELECT id FROM users WHERE email = 'admin@democustomer.com'), 
 (SELECT id FROM roles WHERE name = 'customer_admin'), 
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM users WHERE email = 'platform@albaly.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'staff@democustomer.com'), 
 (SELECT id FROM roles WHERE name = 'customer_staff'), 
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM users WHERE email = 'admin@democustomer.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'user@democustomer.com'), 
 (SELECT id FROM roles WHERE name = 'customer_user'), 
 '550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM users WHERE email = 'admin@democustomer.com'),
 CURRENT_TIMESTAMP),

-- Sample Enterprise (legacy roles for backward compatibility testing)
((SELECT id FROM users WHERE email = 'admin@sampleenterprise.com'), 
 (SELECT id FROM roles WHERE name = 'admin'), 
 '550e8400-e29b-41d4-a716-446655440010',
 (SELECT id FROM users WHERE email = 'platform@albaly.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'staff@sampleenterprise.com'), 
 (SELECT id FROM roles WHERE name = 'staff'), 
 '550e8400-e29b-41d4-a716-446655440010',
 (SELECT id FROM users WHERE email = 'admin@sampleenterprise.com'),
 CURRENT_TIMESTAMP),

((SELECT id FROM users WHERE email = 'user@sampleenterprise.com'), 
 (SELECT id FROM roles WHERE name = 'user'), 
 '550e8400-e29b-41d4-a716-446655440010',
 (SELECT id FROM users WHERE email = 'admin@sampleenterprise.com'),
 CURRENT_TIMESTAMP);

-- Sample companies demonstrating different data sources and privacy levels
-- 1. Shared Albaly reference data (available to all customers)
INSERT INTO companies (
  id, organization_id, name_en, name_th, business_description,
  data_source, source_reference, is_shared_data, data_sensitivity, 
  verification_status, created_by, company_size, data_quality_score,
  primary_industry_id, primary_region_id
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440030', NULL,
  'Siam Commercial Bank PCL', 'ธนาคารไทยพาณิชย์ จำกัด (มหาชน)',
  'Leading commercial bank in Thailand',
  'albaly_list', 'Albaly-Fortune-500-Thailand-2024', 
  true, 'public', 'verified',
  '550e8400-e29b-41d4-a716-446655440001',
  'large',
  0.95,
  (SELECT id FROM ref_industry_codes WHERE code = '46' LIMIT 1),
  (SELECT id FROM ref_regions WHERE code = 'TH-10' LIMIT 1)
),
(
  '550e8400-e29b-41d4-a716-446655440031', NULL,
  'CP Foods PCL', 'บริษัท เจริญโภคภัณฑ์อาหาร จำกัด (มหาชน)',
  'Food and agribusiness conglomerate',
  'dbd_registry', 'DBD-Public-Companies-2024-Q4',
  true, 'public', 'verified',
  '550e8400-e29b-41d4-a716-446655440001',
  'enterprise',
  0.92,
  (SELECT id FROM ref_industry_codes WHERE code = '46' LIMIT 1),
  (SELECT id FROM ref_regions WHERE code = 'TH-10' LIMIT 1)
);

-- 2. Customer-specific private data 
INSERT INTO companies (
  id, organization_id, name_en, business_description,
  data_source, source_reference, is_shared_data, data_sensitivity,
  verification_status, created_by, company_size, data_quality_score,
  primary_industry_id, primary_region_id
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001',
  'Local Bangkok Restaurant Chain', 'Restaurant franchise with 15 locations',
  'customer_input', 'Customer manual entry - 2024-12-18',
  false, 'confidential', 'unverified',
  '550e8400-e29b-41d4-a716-446655440008',
  'medium',
  0.65,
  (SELECT id FROM ref_industry_codes WHERE code = '4610' LIMIT 1),
  (SELECT id FROM ref_regions WHERE code = 'TH-10' LIMIT 1)
),
(
  '550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440001', 
  'Bangkok Tech Startup Ltd', 'AI/ML software development company',
  'customer_input', 'Customer prospect research - 2024-12-18',
  false, 'standard', 'unverified',
  '550e8400-e29b-41d4-a716-446655440008',
  'small',
  0.72,
  (SELECT id FROM ref_industry_codes WHERE code = '62' LIMIT 1),
  (SELECT id FROM ref_regions WHERE code = 'TH-10' LIMIT 1)
);

-- Sample company_tags relationships
INSERT INTO company_tags (company_id, tag_id, added_by) VALUES
((SELECT id FROM companies WHERE name_en = 'Siam Commercial Bank PCL'), 
 (SELECT id FROM ref_tags WHERE key = 'enterprise'), 
 (SELECT id FROM users WHERE email = 'platform@albaly.com')),
((SELECT id FROM companies WHERE name_en = 'CP Foods PCL'), 
 (SELECT id FROM ref_tags WHERE key = 'enterprise'), 
 (SELECT id FROM users WHERE email = 'platform@albaly.com')),
((SELECT id FROM companies WHERE name_en = 'Bangkok Tech Startup Ltd'), 
 (SELECT id FROM ref_tags WHERE key = 'startup'), 
 (SELECT id FROM users WHERE email = 'admin@democustomer.com')),
((SELECT id FROM companies WHERE name_en = 'Bangkok Tech Startup Ltd'), 
 (SELECT id FROM ref_tags WHERE key = 'saas'), 
 (SELECT id FROM users WHERE email = 'admin@democustomer.com')),
((SELECT id FROM companies WHERE name_en = 'Local Bangkok Restaurant Chain'), 
 (SELECT id FROM ref_tags WHERE key = 'high_priority'), 
 (SELECT id FROM users WHERE email = 'admin@democustomer.com'));

COMMIT;

-- =========================================================
-- MAINTENANCE & MONITORING
-- =========================================================

-- Note: audit_logs table no longer uses partitioning for simpler application-level auditing
-- If partitioning is needed in production for performance, consider implementing it based on created_at

-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_search;

-- =========================================================
-- COMMENTS & DOCUMENTATION
-- =========================================================

COMMENT ON DATABASE selly_base IS 'Selly Base - B2B Prospecting SaaS Platform Database';
COMMENT ON TABLE organizations IS 'Multi-tenant organizations/customers for SaaS isolation';
COMMENT ON TABLE users IS 'Users scoped to organizations with RBAC';
COMMENT ON TABLE companies IS 'Canonical company data with SaaS privacy controls - shared reference data (organization_id=NULL) and customer-specific data (organization_id set)';
COMMENT ON TABLE company_lists IS 'User-created company collections with smart list support';
COMMENT ON TABLE lead_projects IS 'Lead generation campaigns and projects';
COMMENT ON TABLE audit_logs IS 'Application-level audit trail for user actions and data changes (matches TypeORM AuditLog entity)';
COMMENT ON TABLE export_jobs IS 'Export job tracking with file metadata';
COMMENT ON TABLE import_jobs IS 'Import job tracking with validation and error handling';

COMMENT ON COLUMN companies.organization_id IS 'NULL for shared reference data (Albaly/DBD), UUID for customer-specific private data';
COMMENT ON COLUMN companies.primary_industry_id IS 'Foreign key to ref_industry_codes table - primary industry classification for the company';
COMMENT ON COLUMN companies.primary_region_id IS 'Foreign key to ref_regions table - primary region/province where the company operates';
COMMENT ON COLUMN companies.data_source IS 'Source of company data: albaly_list, dbd_registry, customer_input, data_enrichment, third_party';
COMMENT ON COLUMN companies.source_reference IS 'Reference to original data source for provenance tracking';
COMMENT ON COLUMN companies.is_shared_data IS 'True for Albaly/DBD shared data, False for customer-specific private data';
COMMENT ON COLUMN companies.data_sensitivity IS 'Data sensitivity level for access control';
COMMENT ON COLUMN companies.search_vector IS 'Generated tsvector for full-text search';
COMMENT ON COLUMN companies.embedding_vector IS 'ML embedding vector for semantic search';
COMMENT ON COLUMN companies.data_quality_score IS 'Computed data quality score 0.0-1.0';

COMMENT ON TABLE company_tags IS 'Many-to-many relationship between companies and tags';
COMMENT ON COLUMN company_tags.company_id IS 'Foreign key to companies table';
COMMENT ON COLUMN company_tags.tag_id IS 'Foreign key to ref_tags table';
COMMENT ON COLUMN company_tags.added_by IS 'User who added this tag to the company';

COMMENT ON INDEX idx_companies_organization IS 'Organization scoping for SaaS multi-tenancy';
COMMENT ON INDEX idx_companies_org_source IS 'Combined organization and data source filtering';
COMMENT ON INDEX idx_companies_shared_data IS 'Fast access to shared reference data';
COMMENT ON INDEX idx_companies_name_trgm IS 'Trigram index for fuzzy company name search';
COMMENT ON INDEX idx_companies_search_vector IS 'Full-text search index';

COMMENT ON MATERIALIZED VIEW mv_company_search IS 'Optimized view for company search with SaaS privacy controls and pre-computed aggregations';
