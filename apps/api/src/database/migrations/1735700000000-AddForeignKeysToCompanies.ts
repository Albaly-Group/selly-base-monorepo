import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeysToCompanies1735700000000
  implements MigrationInterface
{
  name = 'AddForeignKeysToCompanies1735700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ref_industry_codes table first (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_industry_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" text NOT NULL,
        "title_en" text NOT NULL,
        "title_th" text,
        "description" text,
        "classification_system" text NOT NULL,
        "level" integer NOT NULL,
        "parent_code" text,
        "is_active" boolean DEFAULT true,
        "effective_date" date,
        "end_date" date,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("code", "classification_system")
      )
    `);

    // Create ref_regions table (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_regions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" text NOT NULL,
        "name_en" text NOT NULL,
        "name_th" text,
        "region_type" text NOT NULL CHECK ("region_type" IN ('country', 'province', 'district', 'subdistrict')),
        "country_code" text NOT NULL,
        "parent_region_id" uuid REFERENCES "ref_regions"("id"),
        "is_active" boolean DEFAULT true,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("code", "country_code", "region_type")
      )
    `);

    // Create ref_tags table (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ref_tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "key" text UNIQUE NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "color" text,
        "icon" text,
        "category" text,
        "parent_tag_id" uuid REFERENCES "ref_tags"("id"),
        "is_system_tag" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new foreign key columns to companies table
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD COLUMN IF NOT EXISTS "primary_industry_id" uuid,
      ADD COLUMN IF NOT EXISTS "primary_region_id" uuid
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD CONSTRAINT "FK_companies_primary_industry"
      FOREIGN KEY ("primary_industry_id") REFERENCES "ref_industry_codes"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD CONSTRAINT "FK_companies_primary_region"
      FOREIGN KEY ("primary_region_id") REFERENCES "ref_regions"("id")
      ON DELETE SET NULL
    `);

    // Create company_tags junction table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
        "tag_id" uuid NOT NULL REFERENCES "ref_tags"("id") ON DELETE CASCADE,
        "added_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "added_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("company_id", "tag_id")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_companies_primary_industry" ON "companies" ("primary_industry_id") WHERE "primary_industry_id" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_companies_primary_region" ON "companies" ("primary_region_id") WHERE "primary_region_id" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_tags_company" ON "company_tags" ("company_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_company_tags_tag" ON "company_tags" ("tag_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_company_tags_tag"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_company_tags_company"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_companies_primary_region"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_companies_primary_industry"`,
    );

    // Drop company_tags table
    await queryRunner.query(`DROP TABLE IF EXISTS "company_tags"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "companies"
      DROP CONSTRAINT IF EXISTS "FK_companies_primary_region"
    `);

    await queryRunner.query(`
      ALTER TABLE "companies"
      DROP CONSTRAINT IF EXISTS "FK_companies_primary_industry"
    `);

    // Remove columns from companies table
    await queryRunner.query(`
      ALTER TABLE "companies"
      DROP COLUMN IF EXISTS "primary_region_id",
      DROP COLUMN IF EXISTS "primary_industry_id"
    `);

    // Note: We don't drop ref_* tables as they may be used by other parts of the system
    // and may contain important reference data
  }
}
