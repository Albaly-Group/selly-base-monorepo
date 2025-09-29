-- =========================================================
-- Albaly OS — FULL SEED (Core + Common + Lead Listing + Registrations)
-- =========================================================
BEGIN;

-- ---------------------------
-- Extensions
-- ---------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------------------------------
-- Helpers: updated_at trigger
-- ---------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- =========================================================
-- CORE: USERS & RBAC
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT CHECK (status IN ('active','inactive','suspended')) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN users.password IS 'Argon2-hashed login password';

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- =========================================================
-- COMMON: CANONICAL COMPANIES
-- =========================================================
CREATE TABLE IF NOT EXISTS common_company_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- identity / registry (legacy mirror kept; now normalized via common_company_registrations)
  company_name_en TEXT NOT NULL,
  company_name_th TEXT,
  registration_id TEXT,            -- legacy mirror of primary registration_no
  duns_number TEXT,

  -- location (raw + derived)
  address_line TEXT,
  district TEXT,
  amphoe TEXT,
  province_raw TEXT,
  province_detected TEXT,
  province_confidence NUMERIC,
  province_source TEXT,
  country_code TEXT,
  geo_metadata JSONB,

  -- business basics
  business_type_text TEXT,         -- when no TSIC exists (non-DBD or non-registered)
  description TEXT,

  -- finance snapshot
  financials JSONB,                -- {year, revenue, net_profit, assets, equity}

  -- contact
  website TEXT,
  linkedin_url TEXT,
  logo_url TEXT,
  tel TEXT,
  email TEXT,

  -- sourcing / ML
  source TEXT[],
  vector_embedding VECTOR(768),

  -- shareholder roll-up (filled from nationality table)
  main_shareholder_nationality TEXT,

  metadata JSONB,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Normalized keys (for legacy uniqueness behavior)
  norm_registered_id TEXT GENERATED ALWAYS AS (
    NULLIF(regexp_replace(lower(COALESCE(registration_id,'')),'\s+','','g'),'')
  ) STORED,
  norm_company_name_en TEXT GENERATED ALWAYS AS (
    NULLIF(regexp_replace(lower(COALESCE(company_name_en,'')),'\s+','','g'),'')
  ) STORED
);

-- Legacy uniqueness rules still apply for compatibility
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_regid
  ON common_company_lists (norm_registered_id)
  WHERE norm_registered_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_name_when_no_reg
  ON common_company_lists (norm_company_name_en)
  WHERE norm_registered_id IS NULL;

-- indexes
CREATE INDEX IF NOT EXISTS idx_company_trgm_name
  ON common_company_lists USING gin (company_name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_company_registration
  ON common_company_lists (norm_registered_id);
CREATE INDEX IF NOT EXISTS idx_company_province
  ON common_company_lists (province_detected);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_common_company_lists_updated_at') THEN
    CREATE TRIGGER update_common_company_lists_updated_at
    BEFORE UPDATE ON common_company_lists
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- =========================================================
-- NEW: REGISTRATION AUTHORITIES / TYPES / COMPANY REGISTRATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS ref_registration_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,                -- e.g., 'TH-DBD'
  name TEXT NOT NULL,                       -- e.g., 'Department of Business Development'
  country_code TEXT NOT NULL,               -- ISO-3166-1 alpha-2, e.g., 'TH'
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ref_registration_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,                 -- 'company_limited', 'public_company_limited', 'sole_proprietor', ...
  name TEXT NOT NULL,                       -- display name
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS common_company_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES ref_registration_authorities(id) ON DELETE RESTRICT,
  registration_type_id UUID NOT NULL REFERENCES ref_registration_types(id) ON DELETE RESTRICT,

  registration_no TEXT NOT NULL,            -- number as issued by authority
  registration_status TEXT,                 -- 'active','dissolved','suspended', etc.
  registered_date DATE,
  deregistered_date DATE,
  country_code TEXT,                        -- convenience copy for filters
  remarks TEXT,

  is_primary BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  norm_registration_no TEXT GENERATED ALWAYS AS (
    NULLIF(regexp_replace(lower(COALESCE(registration_no,'')),'\s+','','g'),'')
  ) STORED
);

-- Uniqueness per authority + normalized number
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_regs_unique_per_authority
  ON common_company_registrations(authority_id, norm_registration_no);

-- One primary per company
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_regs_one_primary
  ON common_company_registrations(company_id)
  WHERE is_primary = TRUE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_common_company_registrations_updated_at') THEN
    CREATE TRIGGER update_common_company_registrations_updated_at
    BEFORE UPDATE ON common_company_registrations
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Mirror primary registration to legacy columns on common_company_lists
CREATE OR REPLACE FUNCTION sync_company_primary_registration()
RETURNS TRIGGER AS $$
DECLARE v_company UUID;
DECLARE v_regno TEXT;
BEGIN
  v_company := COALESCE(NEW.company_id, OLD.company_id);

  SELECT registration_no
    INTO v_regno
    FROM common_company_registrations
   WHERE company_id = v_company AND is_primary = TRUE
   ORDER BY registered_date NULLS LAST, created_at DESC
   LIMIT 1;

  UPDATE common_company_lists
     SET registration_id = v_regno,
         updated_at = NOW()
   WHERE id = v_company;

  RETURN COALESCE(NEW, OLD);
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='t_company_regs_sync_insupd') THEN
    CREATE TRIGGER t_company_regs_sync_insupd
    AFTER INSERT OR UPDATE ON common_company_registrations
    FOR EACH ROW EXECUTE FUNCTION sync_company_primary_registration();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='t_company_regs_sync_del') THEN
    CREATE TRIGGER t_company_regs_sync_del
    AFTER DELETE ON common_company_registrations
    FOR EACH ROW EXECUTE FUNCTION sync_company_primary_registration();
  END IF;
END $$;

-- =========================================================
-- COMMON: CLIENTS & LEADS
-- =========================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES common_company_lists(id),
  added_by UUID REFERENCES users(id),
  industry_focus TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES common_company_lists(id),
  added_by UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  contact_status TEXT CHECK (contact_status IN ('new','in-progress','called','converted')) DEFAULT 'new',
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- COMMON: CONTACTS (Apollo-style)
-- =========================================================
CREATE TABLE IF NOT EXISTS common_company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_list_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (trim(both ' ' from COALESCE(first_name,'') || ' ' || COALESCE(last_name,''))) STORED,
  title TEXT,
  department TEXT,
  seniority TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  other_profiles JSONB,
  source TEXT,
  enrichment_provider TEXT,
  confidence NUMERIC(3,2),
  last_verified TIMESTAMPTZ,
  is_opted_out BOOLEAN DEFAULT FALSE,
  notes TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  norm_email TEXT GENERATED ALWAYS AS (NULLIF(regexp_replace(lower(COALESCE(email,'')),'\s+','','g'),'')) STORED,
  norm_phone TEXT GENERATED ALWAYS AS (NULLIF(regexp_replace(COALESCE(phone,''), '\D+', '', 'g'),'')) STORED
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_email
  ON common_company_contacts (norm_email) WHERE norm_email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_company_phone
  ON common_company_contacts (company_list_id, norm_phone) WHERE norm_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_company
  ON common_company_contacts (company_list_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_common_company_contacts_updated_at') THEN
    CREATE TRIGGER update_common_company_contacts_updated_at
    BEFORE UPDATE ON common_company_contacts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- =========================================================
-- COMMON: SHAREHOLDERS (NATIONALITY-LEVEL ONLY)
-- =========================================================
CREATE TABLE IF NOT EXISTS common_company_shareholders_nationality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  as_of_year INTEGER,
  as_of_date DATE,
  nationality TEXT NOT NULL,
  shares NUMERIC(20,2),
  investment_value_baht NUMERIC(20,2),
  investment_percent NUMERIC(6,2),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_shareholders_percent_range
    CHECK (investment_percent IS NULL OR (investment_percent >= 0 AND investment_percent <= 100))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_shareholders_company_year_nat
  ON common_company_shareholders_nationality (company_id, as_of_year, nationality);
CREATE INDEX IF NOT EXISTS idx_shareholders_company_year
  ON common_company_shareholders_nationality (company_id, as_of_year);

-- Roll up main shareholder nationality to company
CREATE OR REPLACE FUNCTION set_main_shareholder_nationality_from_nat()
RETURNS TRIGGER AS $$
DECLARE v_company UUID; v_nat TEXT;
BEGIN
  v_company := COALESCE(NEW.company_id, OLD.company_id);
  SELECT nationality
    INTO v_nat
    FROM common_company_shareholders_nationality
   WHERE company_id = v_company
   ORDER BY COALESCE(investment_percent, 0) DESC,
            COALESCE(investment_value_baht, 0) DESC,
            nationality ASC
   LIMIT 1;
  UPDATE common_company_lists
     SET main_shareholder_nationality = v_nat,
         updated_at = NOW()
   WHERE id = v_company;
  RETURN COALESCE(NEW, OLD);
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='t_shareholders_nat_rollup_insupd') THEN
    CREATE TRIGGER t_shareholders_nat_rollup_insupd
    AFTER INSERT OR UPDATE ON common_company_shareholders_nationality
    FOR EACH ROW EXECUTE FUNCTION set_main_shareholder_nationality_from_nat();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='t_shareholders_nat_rollup_del') THEN
    CREATE TRIGGER t_shareholders_nat_rollup_del
    AFTER DELETE ON common_company_shareholders_nationality
    FOR EACH ROW EXECUTE FUNCTION set_main_shareholder_nationality_from_nat();
  END IF;
END $$;

-- Totals view (no stored total rows)
CREATE OR REPLACE VIEW v_company_shareholders_nat_totals AS
SELECT
  company_id,
  as_of_year,
  SUM(shares)                AS total_shares,
  SUM(investment_value_baht) AS total_investment_value_baht,
  CASE WHEN SUM(investment_percent) IS NULL THEN NULL
       ELSE SUM(investment_percent)
  END                        AS total_investment_percent
FROM common_company_shareholders_nationality
GROUP BY company_id, as_of_year;

-- =========================================================
-- COMMON: NESTED TAGGING
-- =========================================================
CREATE TABLE IF NOT EXISTS ref_tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS ref_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES ref_tag_categories(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES ref_tags(id) ON DELETE SET NULL,
  depth SMALLINT DEFAULT 0,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS common_company_tags (
  company_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES ref_tags(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (company_id, tag_id)
);

-- =========================================================
-- COMMON: TSIC 2009 + CLASSIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS ref_tsic_2009 (
  activity_code TEXT PRIMARY KEY CHECK (activity_code ~ '^[0-9]{5}$'),
  title_th TEXT NOT NULL,
  title_en TEXT,
  section CHAR(1),
  division TEXT,
  group_code TEXT,
  class_code TEXT,
  notes JSONB
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_ref_tsic_section') THEN
    ALTER TABLE ref_tsic_2009
      ADD CONSTRAINT ck_ref_tsic_section CHECK (section IS NULL OR section ~ '^[A-U]$');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='company_classification_source') THEN
    CREATE TYPE company_classification_source AS ENUM
      ('dbd_registration','dbd_latest_filing','manual','other_registry');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS common_company_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  source company_classification_source NOT NULL,
  tsic_code TEXT REFERENCES ref_tsic_2009(activity_code),
  business_type_text TEXT,
  objective_text TEXT,
  effective_date DATE,
  filing_year INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_tsic_or_text CHECK (tsic_code IS NOT NULL OR business_type_text IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_company_classifications_company ON common_company_classifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_classifications_tsic ON common_company_classifications(tsic_code);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_common_company_classifications_updated_at') THEN
    CREATE TRIGGER update_common_company_classifications_updated_at
    BEFORE UPDATE ON common_company_classifications
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- =========================================================
-- LEAD LISTING MODULE
-- =========================================================
CREATE TABLE IF NOT EXISTS lead_listing_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active','Inactive')),
  pm_id UUID REFERENCES users(id),
  tl_id UUID REFERENCES users(id),
  mrr NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_listing_project_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_listing_projects(id) ON DELETE CASCADE,
  company_list_id UUID NOT NULL REFERENCES common_company_lists(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('database_pick','import','manual')),
  contributor_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, company_list_id)
);

CREATE TABLE IF NOT EXISTS lead_listing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES lead_listing_projects(id) ON DELETE CASCADE,
  spec_json JSONB NOT NULL,
  target_count INT NOT NULL CHECK (target_count > 0),
  deadline DATE,
  priority INT DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  assigned_user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','completed','overdue')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_listing_one_active_task_per_user
  ON lead_listing_tasks(assigned_user_id)
  WHERE status IN ('assigned','in_progress');

CREATE TABLE IF NOT EXISTS lead_listing_timelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES lead_listing_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES lead_listing_projects(id),
  activity TEXT NOT NULL CHECK (activity IN ('pick','import','manual','other')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT GENERATED ALWAYS AS (
    CASE WHEN ended_at IS NULL THEN NULL
         ELSE GREATEST(0, EXTRACT(EPOCH FROM (ended_at - started_at)))::INT
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_listing_one_open_timelog_per_user
  ON lead_listing_timelogs(user_id)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lead_listing_timelogs_task ON lead_listing_timelogs(task_id);
CREATE INDEX IF NOT EXISTS idx_lead_listing_timelogs_project ON lead_listing_timelogs(project_id);

CREATE TABLE IF NOT EXISTS lead_listing_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES lead_listing_projects(id),
  uploaded_by UUID REFERENCES users(id),
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','parsed','mapped','committed','failed')),
  column_map JSONB,
  summary_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_listing_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES lead_listing_imports(id) ON DELETE CASCADE,
  row_index INT NOT NULL,
  raw_json JSONB NOT NULL,
  parsed_json JSONB,
  dedupe_hint JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_listing_import_rows_import_id
  ON lead_listing_import_rows(import_id);

-- =========================================================
-- LEGACY COMPAT VIEW (optional)
-- =========================================================
DROP VIEW IF EXISTS companies;
CREATE VIEW companies AS
SELECT
  id,
  company_name_en  AS company_name,
  registration_id,
  duns_number,
  country_code,
  province_detected AS region,
  NULL::TEXT        AS city,
  business_type_text AS business_type,
  ARRAY[]::TEXT[]   AS industry_tags,
  website,
  linkedin_url,
  logo_url,
  NULL::JSONB       AS public_contacts,
  description,
  metadata,
  vector_embedding,
  source,
  last_updated,
  created_at,
  updated_at
FROM common_company_lists;
COMMENT ON VIEW companies IS 'Compat read view for legacy code over common_company_lists';

-- =========================================================
-- GLOBAL updated_at TRIGGERS (idempotent)
-- =========================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','roles','permissions','role_permissions','user_roles','user_permissions',
    'clients','leads',
    'common_company_lists','common_company_contacts',
    'common_company_shareholders_nationality',
    'ref_tag_categories','ref_tags','common_company_tags',
    'ref_tsic_2009','common_company_classifications',
    'lead_listing_projects','lead_listing_project_companies',
    'lead_listing_tasks','lead_listing_timelogs',
    'lead_listing_imports','lead_listing_import_rows',
    'ref_registration_authorities','ref_registration_types','common_company_registrations'
  ]
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_'||t||'_updated_at') THEN
      EXECUTE format('CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON %1$I FOR EACH ROW EXECUTE FUNCTION update_timestamp();', t);
    END IF;
  END LOOP;
END $$;

-- =========================================================
-- SEEDS
-- =========================================================

-- Roles
INSERT INTO roles(name, description) VALUES
 ('admin','Full access incl. user & RBAC management'),
 ('editor','Create/edit/export data; cannot manage users/RBAC'),
 ('viewer','Read-only')
ON CONFLICT (name) DO NOTHING;

-- Permissions (extend as needed)
WITH p(key, description) AS (VALUES
 ('auth.login','Login via email/password'),
 ('auth.oauth','Login via Google OAuth'),
 ('rbac.manage','Manage roles & permissions'),
 ('user.manage','Manage users'),
 ('company.read','Read companies'),
 ('company.write','Create/Edit/Delete companies'),
 ('company.export','Export companies CSV/Excel'),
 ('contact.read','Read contacts'),
 ('contact.write','Create/Edit/Delete contacts'),
 ('classification.read','Read classifications'),
 ('classification.write','Create/Edit/Delete classifications'),
 ('shareholder.read','Read shareholders'),
 ('shareholder.write','Create/Edit/Delete shareholders'),
 ('tag.read','Read tag categories & tags'),
 ('tag.write','Create/Edit/Delete tags'),
 ('company.tag.attach','Attach tags to company'),
 ('company.tag.detach','Detach tags from company'),
 ('project.read','Read lead-listing projects'),
 ('project.write','Create/Edit/Delete projects'),
 ('project.attach_company','Attach companies to project'),
 ('task.assign','Create/assign tasks'),
 ('task.work','Start/Pause/Complete tasks'),
 ('timelog.write','Start/Stop timelogs'),
 ('import.run','Run imports'),
 ('report.view','View reports')
)
INSERT INTO permissions(key, description)
SELECT key, description FROM p
ON CONFLICT (key) DO NOTHING;

-- Map Admin → all permissions
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON TRUE
WHERE r.name='admin'
ON CONFLICT DO NOTHING;

-- Map Editor → write data, no RBAC/user.manage
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.key IN (
  'auth.login','auth.oauth',
  'company.read','company.write','company.export',
  'contact.read','contact.write',
  'classification.read','classification.write',
  'shareholder.read','shareholder.write',
  'tag.read','company.tag.attach','company.tag.detach',
  'project.read','project.write','project.attach_company',
  'task.assign','task.work',
  'timelog.write','import.run','report.view'
)
WHERE r.name='editor'
ON CONFLICT DO NOTHING;

-- Map Viewer → read-only
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.key IN (
  'auth.login','auth.oauth',
  'company.read','contact.read','classification.read',
  'shareholder.read','tag.read','project.read','report.view'
)
WHERE r.name='viewer'
ON CONFLICT DO NOTHING;

-- Default admin user (replace hash!)
INSERT INTO users(name, email, password, status, metadata)
VALUES ('System Admin','admin@albaly.local','$argon2id$v=19$m=65536,t=3,p=1$REPLACE_ME$REPLACE_ME','active','{"seed":true}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name='admin'
WHERE u.email='admin@albaly.local'
ON CONFLICT DO NOTHING;

-- Tag categories & sample tags
WITH cats(key, name, description) AS (VALUES
 ('industry_segment','Industry Segment','Top-level industry segmentation'),
 ('business_model','Business Model','How the company makes money')
)
INSERT INTO ref_tag_categories(key, name, description)
SELECT key, name, description FROM cats
ON CONFLICT (key) DO NOTHING;

WITH t(category_key, key, name, parent_key, depth) AS (VALUES
 ('industry_segment','software_services','Software Services',NULL,0),
 ('industry_segment','saas','SaaS','software_services',1),
 ('business_model','subscription','Subscription',NULL,0),
 ('business_model','marketplace','Marketplace',NULL,0)
)
INSERT INTO ref_tags(category_id, key, name, parent_id, depth)
SELECT c.id, t.key, t.name, p.id, t.depth
FROM t
JOIN ref_tag_categories c ON c.key = t.category_key
LEFT JOIN ref_tags p ON p.key = t.parent_key
ON CONFLICT (key) DO NOTHING;

-- Registration Authorities & Types
INSERT INTO ref_registration_authorities(code, name, country_code, website) VALUES
 ('TH-DBD','Department of Business Development','TH','https://www.dbd.go.th')
ON CONFLICT (code) DO NOTHING;

WITH rt(key, name, description) AS (VALUES
 ('company_limited','Company Limited','นิติบุคคล บริษัทจำกัด'),
 ('public_company_limited','Public Company Limited','บริษัทมหาชนจำกัด'),
 ('sole_proprietor','Sole Proprietor','บุคคลธรรมดา (จดทะเบียนพาณิชย์)'),
 ('partnership_limited','Limited Partnership','ห้างหุ้นส่วนจำกัด'),
 ('partnership_registered','Registered Partnership','ห้างหุ้นส่วนสามัญนิติบุคคล'),
 ('branch','Branch Office','สาขานิติบุคคลต่างประเทศ'),
 ('representative_office','Representative Office','สำนักงานผู้แทน'),
 ('foundation','Foundation','มูลนิธิ'),
 ('association','Association','สมาคม'),
 ('other','Other','อื่น ๆ'),
 ('unknown','Unknown','ยังไม่ทราบ/ไม่ระบุ')
)
INSERT INTO ref_registration_types(key, name, description)
SELECT key, name, description FROM rt
ON CONFLICT (key) DO NOTHING;

-- Minimal TSIC seed
INSERT INTO ref_tsic_2009(activity_code, title_th, title_en, section, division, group_code, class_code, notes) VALUES
 ('62022','กิจกรรมการให้คำปรึกษาทางด้านซอฟต์แวร์','Software consultancy activities','J','62','620','6202','{}'),
 ('63113','การบริการเป็นตลาดกลางในการซื้อขายสินค้า/บริการผ่านอินเทอร์เน็ต','E-marketplace over Internet','J','63','631','6311','{}'),
 ('70101','สำนักงานผู้แทนนิติบุคคลระหว่างประเทศ','International business representative offices','M','70','701','7010','{}')
ON CONFLICT (activity_code) DO NOTHING;

-- Example company
INSERT INTO common_company_lists (company_name_en, registration_id, province_raw, province_detected, country_code, website, business_type_text, source)
VALUES ('Example Co., Ltd.','0105559999999','คลองเตย, กรุงเทพฯ','Bangkok','TH','https://example.co','Software consultancy','{manual}')
ON CONFLICT DO NOTHING;

-- Hydrate company_registrations from existing registration_id (legacy mirror)
WITH s AS (
  SELECT id AS company_id, registration_id AS registration_no, COALESCE(country_code, 'TH') AS country_code
  FROM common_company_lists
  WHERE registration_id IS NOT NULL
)
INSERT INTO common_company_registrations
  (company_id, authority_id, registration_type_id, registration_no, registration_status, registered_date, deregistered_date, country_code, remarks, is_primary)
SELECT
  s.company_id,
  a.id,
  rt.id,
  s.registration_no,
  'active',
  NULL,
  NULL,
  s.country_code,
  'Migrated from common_company_lists.registration_id',
  TRUE
FROM s
JOIN ref_registration_authorities a
  ON a.code = CASE WHEN s.country_code = 'TH' THEN 'TH-DBD' ELSE 'TH-DBD' END
JOIN ref_registration_types rt
  ON rt.key = 'unknown'
ON CONFLICT (authority_id, norm_registration_no) DO NOTHING;

-- Example classification / contact / tag
INSERT INTO common_company_classifications (company_id, source, business_type_text, objective_text, is_primary)
SELECT id, 'manual', 'Software services', 'ให้บริการที่ปรึกษาด้านซอฟต์แวร์', TRUE
FROM common_company_lists
WHERE company_name_en = 'Example Co., Ltd.'
ON CONFLICT DO NOTHING;

INSERT INTO common_company_contacts (company_list_id, first_name, last_name, title, email, phone, source, enrichment_provider, confidence)
SELECT id, 'Somchai', 'Dee','CTO','somchai@example.co','+66-2-000-0000','manual','internal',0.90
FROM common_company_lists
WHERE company_name_en = 'Example Co., Ltd.'
ON CONFLICT DO NOTHING;

INSERT INTO common_company_tags (company_id, tag_id)
SELECT c.id, t.id
FROM common_company_lists c
JOIN ref_tags t ON t.key='saas'
WHERE c.company_name_en='Example Co., Ltd.'
ON CONFLICT DO NOTHING;

-- Shareholders (nationality-level)
WITH c AS (SELECT id FROM common_company_lists WHERE company_name_en = 'Example Co., Ltd.' LIMIT 1)
INSERT INTO common_company_shareholders_nationality
  (company_id, as_of_year, nationality, shares, investment_value_baht, investment_percent, source)
SELECT id, 2024, 'ไทย', 100000.00, 1000000.00, 100.00, 'DBD' FROM c
ON CONFLICT (company_id, as_of_year, nationality) DO UPDATE
SET shares=EXCLUDED.shares,
    investment_value_baht=EXCLUDED.investment_value_baht,
    investment_percent=EXCLUDED.investment_percent,
    updated_at=NOW();

COMMIT;

-- ======================
-- Optional: TSIC bulk load later
-- ======================
-- COPY ref_tsic_2009 (activity_code,title_th,title_en,section,division,group_code,class_code,notes)
-- FROM '/absolute/path/to/tsic_2552_seed.csv'
-- WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', QUOTE '"', ESCAPE '"');

-- =========================================================
-- COMMENTS (tables, columns, indexes, triggers, functions, views)
-- (Same detailed comments as previously provided; keep as companion run if you prefer)
-- =========================================================

-- =========================================================
-- Albaly OS — Companion Documentation File
-- Full COMMENT ON statements for all tables, columns, indexes, triggers, views, functions
-- =========================================================

-- =========================================================
-- USERS & RBAC
-- =========================================================
COMMENT ON TABLE users IS 'System users (internal staff with authentication and RBAC roles).';
COMMENT ON COLUMN users.id IS 'Primary key (UUID).';
COMMENT ON COLUMN users.name IS 'Full display name.';
COMMENT ON COLUMN users.email IS 'Login email (CITEXT, case-insensitive, unique).';
COMMENT ON COLUMN users.password IS 'Argon2-hashed password.';
COMMENT ON COLUMN users.avatar_url IS 'Profile picture URL.';
COMMENT ON COLUMN users.status IS 'User status: active / inactive / suspended.';
COMMENT ON COLUMN users.metadata IS 'Flexible JSON metadata for user profile.';
COMMENT ON COLUMN users.created_at IS 'Creation timestamp.';
COMMENT ON COLUMN users.updated_at IS 'Last updated timestamp.';

COMMENT ON TABLE roles IS 'RBAC roles (Admin, Editor, Viewer).';
COMMENT ON TABLE permissions IS 'Granular RBAC permissions (atomic actions).';
COMMENT ON TABLE role_permissions IS 'Join table: many-to-many between roles and permissions.';
COMMENT ON TABLE user_roles IS 'Join table: many-to-many between users and roles.';
COMMENT ON TABLE user_permissions IS 'Direct user→permission overrides.';

COMMENT ON INDEX idx_user_roles_user_id IS 'Lookup index on user_roles.user_id.';
COMMENT ON INDEX idx_role_permissions_role_id IS 'Lookup index on role_permissions.role_id.';
COMMENT ON INDEX idx_user_permissions_user_id IS 'Lookup index on user_permissions.user_id.';

COMMENT ON TRIGGER update_users_updated_at ON users IS 'Keeps users.updated_at current.';
COMMENT ON TRIGGER update_roles_updated_at ON roles IS 'Keeps roles.updated_at current.';
COMMENT ON TRIGGER update_permissions_updated_at ON permissions IS 'Keeps permissions.updated_at current.';

-- =========================================================
-- COMMON: COMPANIES
-- =========================================================
COMMENT ON TABLE common_company_lists IS 'Canonical company registry (links to clients, leads, registrations, contacts, tags).';
COMMENT ON COLUMN common_company_lists.registration_id IS 'Legacy mirror of primary registration_no (from normalized registrations).';
COMMENT ON COLUMN common_company_lists.norm_registered_id IS 'Normalized registration ID (lowercase, no spaces).';
COMMENT ON COLUMN common_company_lists.norm_company_name_en IS 'Normalized English company name (lowercase, no spaces).';
COMMENT ON COLUMN common_company_lists.main_shareholder_nationality IS 'Rolled-up nationality of majority shareholder.';

COMMENT ON INDEX uq_company_regid IS 'Unique reg ID if present.';
COMMENT ON INDEX uq_company_name_when_no_reg IS 'Unique English name if no reg ID.';
COMMENT ON INDEX idx_company_trgm_name IS 'GIN trigram index on company_name_en.';
COMMENT ON INDEX idx_company_registration IS 'Index on normalized registration ID.';
COMMENT ON INDEX idx_company_province IS 'Index on detected province.';

COMMENT ON TRIGGER update_common_company_lists_updated_at ON common_company_lists IS 'Keeps updated_at current.';

-- =========================================================
-- COMMON: REGISTRATIONS
-- =========================================================
COMMENT ON TABLE ref_registration_authorities IS 'Registration authorities (e.g., DBD Thailand) with jurisdiction.';
COMMENT ON COLUMN ref_registration_authorities.code IS 'Stable code (e.g., TH-DBD).';
COMMENT ON COLUMN ref_registration_authorities.name IS 'Authority name.';
COMMENT ON COLUMN ref_registration_authorities.country_code IS 'ISO country code (authority jurisdiction).';
COMMENT ON COLUMN ref_registration_authorities.website IS 'Authority website.';

COMMENT ON TABLE ref_registration_types IS 'Legal forms / registration types (normalized).';
COMMENT ON COLUMN ref_registration_types.key IS 'Machine key (company_limited, sole_proprietor, etc.).';
COMMENT ON COLUMN ref_registration_types.name IS 'Display name.';
COMMENT ON COLUMN ref_registration_types.description IS 'Description.';

COMMENT ON TABLE common_company_registrations IS 'Normalized company registrations: authority + type + number.';
COMMENT ON COLUMN common_company_registrations.company_id IS 'FK to common_company_lists.id.';
COMMENT ON COLUMN common_company_registrations.authority_id IS 'FK to ref_registration_authorities.id.';
COMMENT ON COLUMN common_company_registrations.registration_type_id IS 'FK to ref_registration_types.id.';
COMMENT ON COLUMN common_company_registrations.registration_no IS 'Raw registration number.';
COMMENT ON COLUMN common_company_registrations.registration_status IS 'Status (active/dissolved/suspended).';
COMMENT ON COLUMN common_company_registrations.is_primary IS 'One primary registration per company (mirrored to common_company_lists).';
COMMENT ON COLUMN common_company_registrations.norm_registration_no IS 'Normalized reg no (lowercase, no spaces).';

COMMENT ON INDEX uq_company_regs_unique_per_authority IS 'Unique registration per (authority, reg no normalized).';
COMMENT ON INDEX uq_company_regs_one_primary IS 'Enforces single primary registration per company.';
COMMENT ON TRIGGER update_common_company_registrations_updated_at ON common_company_registrations IS 'Keeps updated_at current.';
COMMENT ON FUNCTION sync_company_primary_registration() IS 'Mirrors primary registration_no back to common_company_lists.registration_id.';
COMMENT ON TRIGGER t_company_regs_sync_insupd ON common_company_registrations IS 'Sync company primary after insert/update.';
COMMENT ON TRIGGER t_company_regs_sync_del ON common_company_registrations IS 'Sync company primary after delete.';

-- =========================================================
-- COMMON: CLIENTS & LEADS
-- =========================================================
COMMENT ON TABLE clients IS 'Albaly’s clients (companies we serve).';
COMMENT ON TABLE leads IS 'Leads linked to client companies.';
COMMENT ON COLUMN leads.contact_status IS 'Lead contact status: new / in-progress / called / converted.';

-- =========================================================
-- COMMON: CONTACTS
-- =========================================================
COMMENT ON TABLE common_company_contacts IS 'Individual contacts tied to company lists (Apollo.io style).';
COMMENT ON COLUMN common_company_contacts.norm_email IS 'Normalized email (lowercased, stripped spaces).';
COMMENT ON COLUMN common_company_contacts.norm_phone IS 'Normalized phone (digits only).';

COMMENT ON INDEX uq_contact_email IS 'Unique per normalized email.';
COMMENT ON INDEX uq_contact_company_phone IS 'Unique per (company, phone).';
COMMENT ON INDEX idx_contacts_company IS 'Lookup contacts by company.';

-- =========================================================
-- COMMON: SHAREHOLDERS
-- =========================================================
COMMENT ON TABLE common_company_shareholders_nationality IS 'Nationality-level shareholder aggregates (DBD filings).';
COMMENT ON COLUMN common_company_shareholders_nationality.as_of_year IS 'Filing year.';
COMMENT ON COLUMN common_company_shareholders_nationality.nationality IS 'Shareholder nationality.';
COMMENT ON COLUMN common_company_shareholders_nationality.shares IS 'Number of shares.';
COMMENT ON COLUMN common_company_shareholders_nationality.investment_value_baht IS 'Investment value (baht).';
COMMENT ON COLUMN common_company_shareholders_nationality.investment_percent IS 'Ownership % (0–100).';

COMMENT ON INDEX uq_shareholders_company_year_nat IS 'Unique per (company, year, nationality).';
COMMENT ON INDEX idx_shareholders_company_year IS 'Index per (company, year).';

COMMENT ON FUNCTION set_main_shareholder_nationality_from_nat() IS 'Updates main_shareholder_nationality in company_lists.';
COMMENT ON TRIGGER t_shareholders_nat_rollup_insupd ON common_company_shareholders_nationality IS 'Updates parent nationality on insert/update.';
COMMENT ON TRIGGER t_shareholders_nat_rollup_del ON common_company_shareholders_nationality IS 'Updates parent nationality on delete.';
COMMENT ON VIEW v_company_shareholders_nat_totals IS 'Computed totals of nationality-level shares per company per year.';

-- =========================================================
-- COMMON: TAGGING
-- =========================================================
COMMENT ON TABLE ref_tag_categories IS 'Reference categories for tags.';
COMMENT ON TABLE ref_tags IS 'Reference tags (hierarchical, linked to categories).';
COMMENT ON TABLE common_company_tags IS 'Join table: company ↔ tags.';

-- =========================================================
-- COMMON: TSIC + CLASSIFICATIONS
-- =========================================================
COMMENT ON TABLE ref_tsic_2009 IS 'Thai Standard Industrial Classification 2552 (5-digit).';
COMMENT ON TABLE common_company_classifications IS 'Company classifications (multi-source, TSIC or freeform).';
COMMENT ON COLUMN common_company_classifications.source IS 'Source: dbd_registration / dbd_latest_filing / manual / other_registry.';
COMMENT ON COLUMN common_company_classifications.is_primary IS 'Primary classification flag.';

COMMENT ON INDEX idx_company_classifications_company IS 'Index by company.';
COMMENT ON INDEX idx_company_classifications_tsic IS 'Index by TSIC code.';

-- =========================================================
-- LEAD LISTING
-- =========================================================
COMMENT ON TABLE lead_listing_projects IS 'Lead listing projects (managed by PM/TL).';
COMMENT ON TABLE lead_listing_project_companies IS 'Join table: project ↔ companies.';
COMMENT ON TABLE lead_listing_tasks IS 'Tasks assigned by PM to list builders.';
COMMENT ON COLUMN lead_listing_tasks.status IS 'Task status: assigned / in_progress / completed / overdue.';
COMMENT ON INDEX uq_lead_listing_one_active_task_per_user IS 'One active task at a time per user.';
COMMENT ON TABLE lead_listing_timelogs IS 'Work session logs for tasks.';
COMMENT ON COLUMN lead_listing_timelogs.activity IS 'Activity type: pick / import / manual / other.';
COMMENT ON INDEX uq_lead_listing_one_open_timelog_per_user IS 'One open timelog at a time per user.';
COMMENT ON TABLE lead_listing_imports IS 'File imports for company lists.';
COMMENT ON TABLE lead_listing_import_rows IS 'Rows staged from an import file.';

-- =========================================================
-- LEGACY VIEW
-- =========================================================
COMMENT ON VIEW companies IS 'Compat read view for legacy code over common_company_lists.';

