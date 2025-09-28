-- =========================================================
-- SELLY BASE - OPTIMIZED DATABASE SCHEMA v2.0
-- =========================================================
-- Redesigned for user journey optimization, scalability, and consistency
-- All foreign keys properly aligned, multi-tenant architecture
-- Performance optimized with strategic indexing and caching support
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

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate search vector for full-text search
CREATE OR REPLACE FUNCTION generate_search_vector(company_name TEXT, description TEXT DEFAULT '')
RETURNS tsvector AS $$
BEGIN
  RETURN to_tsvector('english', COALESCE(company_name, '') || ' ' || COALESCE(description, ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================================
-- CORE MULTI-TENANT ARCHITECTURE
-- =========================================================

-- Organizations (Tenants)
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

-- Users (Multi-tenant aware)
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

-- Roles (System-wide)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Role Assignments (Multi-tenant scoped)
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
-- CANONICAL COMPANY DATA
-- =========================================================

-- Main companies table (Single source of truth)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Identity
  name_en TEXT NOT NULL,
  name_th TEXT,
  name_local TEXT, -- For non-Thai international companies
  display_name TEXT GENERATED ALWAYS AS (COALESCE(name_en, name_th)) STORED,
  
  -- Registration Info
  primary_registration_no TEXT,
  registration_country_code TEXT DEFAULT 'TH',
  duns_number TEXT,
  
  -- Location
  address_line_1 TEXT,
  address_line_2 TEXT,
  district TEXT,
  subdistrict TEXT,
  province TEXT,
  postal_code TEXT,
  country_code TEXT DEFAULT 'TH',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Business Info
  business_description TEXT,
  established_date DATE,
  employee_count_estimate INTEGER,
  company_size TEXT CHECK (company_size IN ('micro', 'small', 'medium', 'large', 'enterprise')),
  annual_revenue_estimate DECIMAL(15,2),
  currency_code TEXT DEFAULT 'THB',
  
  -- Contact Info
  website_url TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  
  -- Rich Data
  logo_url TEXT,
  industry_classification JSONB DEFAULT '{}', -- Store TSIC, NAICS, etc.
  tags TEXT[] DEFAULT '{}',
  
  -- Search & ML
  search_vector tsvector GENERATED ALWAYS AS (
    generate_search_vector(name_en, business_description)
  ) STORED,
  embedding_vector VECTOR(768),
  
  -- Data Quality & Provenance
  data_quality_score DECIMAL(3,2) DEFAULT 0.0,
  source_systems TEXT[] DEFAULT '{}',
  last_enriched_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'unverified' CHECK (
    verification_status IN ('verified', 'unverified', 'disputed', 'inactive')
  ),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  )
);

-- Company registrations (multiple per company)
CREATE TABLE company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  registration_no TEXT NOT NULL,
  registration_type TEXT NOT NULL, -- 'company_limited', 'public_limited', etc.
  authority_code TEXT NOT NULL, -- 'TH-DBD', 'US-DE', etc.
  country_code TEXT NOT NULL,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved', 'suspended')),
  registered_date DATE,
  dissolved_date DATE,
  
  is_primary BOOLEAN DEFAULT false,
  
  -- Raw data from registration authority
  raw_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(registration_no, authority_code)
);

-- Company contacts (Apollo/Sales Navigator style)
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
  
  -- Data quality
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  last_verified_at TIMESTAMPTZ,
  verification_method TEXT,
  
  -- Opt-out handling
  is_opted_out BOOLEAN DEFAULT false,
  opt_out_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- COMPANY LISTS & LEAD MANAGEMENT  
-- =========================================================

-- Company Lists (User-created collections)
CREATE TABLE company_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Access control
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'organization', 'public')),
  is_shared BOOLEAN DEFAULT false,
  
  -- List metadata
  total_companies INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Smart list configuration
  is_smart_list BOOLEAN DEFAULT false,
  smart_criteria JSONB DEFAULT '{}', -- Store search/filter criteria for auto-updates
  last_refreshed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Company list items (Many-to-many with metadata)
CREATE TABLE company_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES company_lists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Item metadata
  note TEXT,
  position INTEGER, -- For manual ordering
  custom_fields JSONB DEFAULT '{}',
  
  -- Lead scoring
  lead_score DECIMAL(5,2) DEFAULT 0.0,
  score_breakdown JSONB DEFAULT '{}',
  score_calculated_at TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  status_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(list_id, company_id)
);

-- =========================================================
-- LEAD PROJECTS (Workflow Management)
-- =========================================================

-- Lead projects (Campaigns/initiatives)
CREATE TABLE lead_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Project lifecycle
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Ownership & assignments
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pm_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_lead_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timeline
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  
  -- Goals & metrics
  target_company_count INTEGER,
  target_contact_count INTEGER,
  target_meetings INTEGER,
  target_revenue DECIMAL(15,2),
  actual_metrics JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project company associations
CREATE TABLE lead_project_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- How this company was added
  source_method TEXT CHECK (source_method IN ('manual', 'import', 'smart_list', 'api')),
  source_list_id UUID REFERENCES company_lists(id) ON DELETE SET NULL,
  
  -- Project-specific data
  priority_score DECIMAL(5,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'contacted', 'qualified', 'converted', 'rejected')),
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(project_id, company_id)
);

-- Project tasks (Workflow steps)
CREATE TABLE lead_project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_projects(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Task properties
  task_type TEXT CHECK (task_type IN ('research', 'outreach', 'followup', 'demo', 'proposal', 'negotiation')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  
  -- Assignment
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timeline
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Dependencies
  depends_on_task_ids UUID[],
  blocks_task_ids UUID[],
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- REFERENCE DATA
-- =========================================================

-- Industry classifications (TSIC, NAICS, etc.)
CREATE TABLE ref_industry_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_th TEXT,
  description TEXT,
  
  classification_system TEXT NOT NULL, -- 'TSIC_2009', 'NAICS_2017', etc.
  level INTEGER NOT NULL, -- 1=section, 2=division, 3=group, 4=class
  parent_code TEXT,
  
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  end_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(code, classification_system)
);

-- Geographic regions
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
  
  UNIQUE(code, country_code, region_type)
);

-- Company tags/categories
CREATE TABLE ref_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon name/unicode
  
  category TEXT, -- 'industry', 'stage', 'priority', etc.
  parent_tag_id UUID REFERENCES ref_tags(id),
  
  is_system_tag BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- AUDIT & LOGGING
-- =========================================================

-- Comprehensive audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
  
  -- Before/after data
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Who & when
  user_id UUID,
  organization_id UUID,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Context
  api_endpoint TEXT,
  request_id TEXT,
  correlation_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- User activity tracking
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL, -- 'login', 'search', 'export', 'list_created', etc.
  entity_type TEXT, -- 'company', 'list', 'project', etc.
  entity_id UUID,
  
  details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- PERFORMANCE OPTIMIZATION
-- =========================================================

-- Materialized view for company search
CREATE MATERIALIZED VIEW mv_company_search AS
SELECT 
  c.id,
  c.name_en,
  c.name_th,
  c.display_name,
  c.primary_registration_no,
  c.province,
  c.country_code,
  c.business_description,
  c.website_url,
  c.company_size,
  c.tags,
  c.verification_status,
  c.data_quality_score,
  c.search_vector,
  
  -- Aggregated contact count
  COALESCE(cc.contact_count, 0) as contact_count,
  
  -- Primary registration info
  pr.registration_no as primary_registration_no_full,
  pr.authority_code,
  
  -- List membership count
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

-- Users
CREATE INDEX idx_users_organization_email ON users(organization_id, email);
CREATE INDEX idx_users_organization_status ON users(organization_id, status);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE last_login_at IS NOT NULL;

-- Companies (Core search indexes)
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name_en gin_trgm_ops);
CREATE INDEX idx_companies_search_vector ON companies USING gin(search_vector);
CREATE INDEX idx_companies_province ON companies(province) WHERE province IS NOT NULL;
CREATE INDEX idx_companies_size ON companies(company_size) WHERE company_size IS NOT NULL;
CREATE INDEX idx_companies_verification ON companies(verification_status);
CREATE INDEX idx_companies_registration_no ON companies(primary_registration_no) WHERE primary_registration_no IS NOT NULL;

-- Company lists
CREATE INDEX idx_company_lists_org_owner ON company_lists(organization_id, owner_user_id);
CREATE INDEX idx_company_lists_visibility ON company_lists(visibility);
CREATE INDEX idx_company_lists_smart ON company_lists(is_smart_list) WHERE is_smart_list = true;
CREATE INDEX idx_company_lists_activity ON company_lists(last_activity_at DESC);

-- Company list items
CREATE INDEX idx_list_items_list_position ON company_list_items(list_id, position) WHERE position IS NOT NULL;
CREATE INDEX idx_list_items_company ON company_list_items(company_id);
CREATE INDEX idx_list_items_status ON company_list_items(status);
CREATE INDEX idx_list_items_score ON company_list_items(lead_score DESC) WHERE lead_score IS NOT NULL;

-- Lead projects
CREATE INDEX idx_lead_projects_org_status ON lead_projects(organization_id, status);
CREATE INDEX idx_lead_projects_owner ON lead_projects(owner_user_id);
CREATE INDEX idx_lead_projects_dates ON lead_projects(start_date, target_end_date);

-- Audit logs (time-series optimized)
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at DESC);

-- User activity (analytics optimized) 
CREATE INDEX idx_activity_user_type ON user_activity_logs(user_id, activity_type, created_at DESC);
CREATE INDEX idx_activity_org_type ON user_activity_logs(organization_id, activity_type, created_at DESC);

-- Contacts
CREATE INDEX idx_contacts_company ON company_contacts(company_id);
CREATE INDEX idx_contacts_email ON company_contacts(email) WHERE email IS NOT NULL AND is_opted_out = false;

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Auto-update timestamps
CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_company_lists_updated_at BEFORE UPDATE ON company_lists FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();
CREATE TRIGGER trigger_lead_projects_updated_at BEFORE UPDATE ON lead_projects FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- Update company list counts
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

-- Insert system roles
INSERT INTO roles (name, description, is_system_role, permissions) VALUES
('platform_admin', 'Platform Administrator', true, ARRAY['*']),
('org_admin', 'Organization Administrator', true, ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']),
('team_lead', 'Team Lead', true, ARRAY['projects:*', 'lists:*', 'companies:read']),
('sales_user', 'Sales User', true, ARRAY['lists:create', 'lists:read:own', 'companies:read', 'contacts:read']),
('viewer', 'Read-only User', true, ARRAY['companies:read', 'lists:read:shared']);

-- Insert default organization (for demo)
INSERT INTO organizations (id, name, slug, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Albaly Digital', 'albaly', 'active');

-- Insert demo users
INSERT INTO users (id, organization_id, email, name, password_hash, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@albaly.com', 'Admin User', '$argon2id$v=19$m=65536,t=3,p=4$dummy_hash', 'active'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'sales@albaly.com', 'Sales User', '$argon2id$v=19$m=65536,t=3,p=4$dummy_hash', 'active');

-- Sample industry codes
INSERT INTO ref_industry_codes (code, title_en, title_th, classification_system, level) VALUES
('46', 'Wholesale trade', 'ขายส่ง', 'TSIC_2009', 2),
('4610', 'Wholesale on a fee or contract basis', 'ขายส่งโดยคิดค่าจ้างหรือตามสัญญา', 'TSIC_2009', 4),
('62', 'Computer programming and information service activities', 'กิจกรรมการเขียนโปรแกรมคอมพิวเตอร์และบริการสารสนเทศ', 'TSIC_2009', 2);

-- Sample regions
INSERT INTO ref_regions (code, name_en, name_th, region_type, country_code) VALUES
('TH', 'Thailand', 'ประเทศไทย', 'country', 'TH'),
('TH-10', 'Bangkok', 'กรุงเทพมหานคร', 'province', 'TH'),
('TH-11', 'Samut Prakan', 'สมุทรปราการ', 'province', 'TH');

-- Sample tags
INSERT INTO ref_tags (key, name, description, category, color) VALUES
('saas', 'SaaS', 'Software as a Service companies', 'business_model', '#3b82f6'),
('enterprise', 'Enterprise', 'Large enterprise companies', 'size', '#059669'),
('startup', 'Startup', 'Early stage startup companies', 'stage', '#dc2626'),
('high_priority', 'High Priority', 'High priority prospect', 'priority', '#ea580c');

COMMIT;

-- =========================================================
-- MAINTENANCE & MONITORING
-- =========================================================

-- Create partitions for audit logs (monthly partitions)
-- This would typically be managed by a cron job or partition manager
DO $$
DECLARE
  start_date TIMESTAMPTZ := DATE_TRUNC('month', CURRENT_TIMESTAMP);
  end_date TIMESTAMPTZ := start_date + INTERVAL '1 month';
  partition_name TEXT := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
END $$;

-- Refresh materialized view (should be scheduled)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_search;

-- =========================================================
-- COMMENTS & DOCUMENTATION
-- =========================================================

COMMENT ON DATABASE postgres IS 'Selly Base - B2B Prospecting Platform Database';

COMMENT ON TABLE organizations IS 'Multi-tenant organizations/customers';
COMMENT ON TABLE users IS 'Users scoped to organizations with RBAC';
COMMENT ON TABLE companies IS 'Canonical company data - single source of truth';
COMMENT ON TABLE company_lists IS 'User-created company collections with smart list support';
COMMENT ON TABLE lead_projects IS 'Lead generation campaigns and projects';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all data changes';

COMMENT ON COLUMN companies.search_vector IS 'Generated tsvector for full-text search';
COMMENT ON COLUMN companies.embedding_vector IS 'ML embedding vector for semantic search';
COMMENT ON COLUMN companies.data_quality_score IS 'Computed data quality score 0.0-1.0';

COMMENT ON INDEX idx_companies_name_trgm IS 'Trigram index for fuzzy company name search';
COMMENT ON INDEX idx_companies_search_vector IS 'Full-text search index';

COMMENT ON MATERIALIZED VIEW mv_company_search IS 'Optimized view for company search with pre-computed aggregations';