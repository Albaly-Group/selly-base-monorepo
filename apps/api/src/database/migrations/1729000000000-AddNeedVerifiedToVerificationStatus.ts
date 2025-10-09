import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNeedVerifiedToVerificationStatus1729000000000
  implements MigrationInterface
{
  name = 'AddNeedVerifiedToVerificationStatus1729000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing constraint
    await queryRunner.query(`
      ALTER TABLE "companies" 
      DROP CONSTRAINT IF EXISTS "companies_verification_status_check"
    `);

    // Add the new constraint with 'need_verified' included
    await queryRunner.query(`
      ALTER TABLE "companies" 
      ADD CONSTRAINT "companies_verification_status_check" 
      CHECK (verification_status IN ('verified', 'unverified', 'need_verified', 'disputed', 'inactive'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to the original constraint without 'need_verified'
    await queryRunner.query(`
      ALTER TABLE "companies" 
      DROP CONSTRAINT IF EXISTS "companies_verification_status_check"
    `);

    await queryRunner.query(`
      ALTER TABLE "companies" 
      ADD CONSTRAINT "companies_verification_status_check" 
      CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'inactive'))
    `);
  }
}