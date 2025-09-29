import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1735601000000 implements MigrationInterface {
  name = 'InitialSchema1735601000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);

    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "slug" text UNIQUE NOT NULL,
        "domain" text,
        "status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        "subscription_tier" text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
        "settings" jsonb DEFAULT '{}',
        "metadata" jsonb DEFAULT '{}',
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "email" citext UNIQUE NOT NULL,
        "name" text NOT NULL,
        "password_hash" text NOT NULL,
        "avatar_url" text,
        "status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        "last_login_at" TIMESTAMPTZ,
        "email_verified_at" TIMESTAMPTZ,
        "settings" jsonb DEFAULT '{}',
        "metadata" jsonb DEFAULT '{}',
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name_en" text NOT NULL,
        "name_th" text,
        "name_local" text,
        "display_name" text GENERATED ALWAYS AS (COALESCE(name_en, name_th)) STORED,
        "primary_registration_no" text,
        "registration_country_code" text DEFAULT 'TH',
        "duns_number" text,
        "address_line_1" text,
        "address_line_2" text,
        "district" text,
        "subdistrict" text,
        "province" text,
        "postal_code" text,
        "country_code" text DEFAULT 'TH',
        "latitude" DECIMAL(10,8),
        "longitude" DECIMAL(11,8),
        "business_description" text,
        "established_date" DATE,
        "employee_count_estimate" INTEGER,
        "company_size" text CHECK (company_size IN ('micro', 'small', 'medium', 'large', 'enterprise')),
        "annual_revenue_estimate" DECIMAL(15,2),
        "currency_code" text DEFAULT 'THB',
        "website_url" text,
        "linkedin_url" text,
        "facebook_url" text,
        "primary_email" text,
        "primary_phone" text,
        "logo_url" text,
        "industry_classification" jsonb DEFAULT '{}',
        "tags" text[] DEFAULT '{}',
        "data_quality_score" DECIMAL(3,2) DEFAULT 0.0,
        "data_source" text DEFAULT 'customer_input' CHECK (data_source IN ('albaly_list', 'dbd_registry', 'customer_input', 'data_enrichment', 'third_party')),
        "source_reference" text,
        "is_shared_data" boolean DEFAULT false,
        "data_sensitivity" text DEFAULT 'standard' CHECK (data_sensitivity IN ('public', 'standard', 'confidential', 'restricted')),
        "last_enriched_at" TIMESTAMPTZ,
        "verification_status" text DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'inactive')),
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "created_by" uuid,
        "updated_by" uuid
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text UNIQUE NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_roles table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "assigned_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("user_id", "role_id")
      )
    `);

    // Create company_lists table
    await queryRunner.query(`
      CREATE TABLE "company_lists" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "description" text,
        "tags" text[] DEFAULT '{}',
        "is_public" boolean DEFAULT false,
        "is_pinned" boolean DEFAULT false,
        "owner_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_list_items table
    await queryRunner.query(`
      CREATE TABLE "company_list_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "list_id" uuid NOT NULL REFERENCES "company_lists"("id") ON DELETE CASCADE,
        "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
        "notes" text,
        "status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'contacted', 'qualified')),
        "position" integer DEFAULT 0,
        "added_by" uuid REFERENCES "users"("id"),
        "added_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("list_id", "company_id")
      )
    `);

    // Create company_contacts table
    await queryRunner.query(`
      CREATE TABLE "company_contacts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "position" text,
        "email" text,
        "phone" text,
        "linkedin_url" text,
        "notes" text,
        "is_primary" boolean DEFAULT false,
        "is_verified" boolean DEFAULT false,
        "last_contacted_at" TIMESTAMPTZ,
        "contact_source" text DEFAULT 'manual',
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" uuid REFERENCES "organizations"("id") ON DELETE CASCADE,
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "entity_type" text NOT NULL,
        "entity_id" uuid,
        "action" text NOT NULL,
        "old_values" jsonb,
        "new_values" jsonb,
        "ip_address" inet,
        "user_agent" text,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_slug" ON "organizations" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_organization_id" ON "users" ("organization_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_organization_id" ON "companies" ("organization_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_name_en" ON "companies" ("name_en")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_display_name" ON "companies" ("display_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_companies_tags" ON "companies" USING gin ("tags")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_lists_organization_id" ON "company_lists" ("organization_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_list_items_list_id" ON "company_list_items" ("list_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_list_items_company_id" ON "company_list_items" ("company_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_contacts_company_id" ON "company_contacts" ("company_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_organization_id" ON "audit_logs" ("organization_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entity_type", "entity_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`,
    );

    // Insert default roles
    await queryRunner.query(`
      INSERT INTO "roles" ("id", "name", "description") VALUES
      (gen_random_uuid(), 'platform_admin', 'Platform administrator with full system access'),
      (gen_random_uuid(), 'customer_admin', 'Organization administrator with full organization access'),
      (gen_random_uuid(), 'customer_staff', 'Organization staff with limited access'),
      (gen_random_uuid(), 'customer_user', 'Basic organization user')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to respect foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company_contacts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company_list_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company_lists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);

    // Drop extensions if no other tables use them
    await queryRunner.query(`DROP EXTENSION IF EXISTS "citext"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
