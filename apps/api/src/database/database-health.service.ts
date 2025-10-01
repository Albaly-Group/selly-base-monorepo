import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(
    private configService: ConfigService,
    @Optional() private dataSource?: DataSource,
  ) {}

  async onModuleInit() {
    // Skip health check if database is disabled
    const skipDatabase =
      this.configService.get<string>('SKIP_DATABASE')?.toLowerCase() === 'true';
    if (skipDatabase) {
      this.logger.log('Database health check skipped (SKIP_DATABASE=true)');
      return;
    }

    if (!this.dataSource) {
      this.logger.warn('DataSource not available, skipping health check');
      return;
    }

    try {
      if (this.dataSource.isInitialized) {
        await this.checkDatabaseHealth();
      } else {
        this.logger.warn('DataSource not initialized, skipping health check');
      }
    } catch (error) {
      this.logger.error('Database health check failed', error);
      // Don't throw here to prevent app crash - let the app start in limited mode
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    try {
      // Simple health check query
      await this.dataSource!.query('SELECT 1');

      // Set search_path to public schema to ensure tables are found
      // This approach works with both regular PostgreSQL and pooled connections (like Neon)
      try {
        await this.dataSource!.query('SET search_path TO public');
      } catch (searchPathError) {
        // Log but don't fail if search_path cannot be set
        this.logger.warn(
          '⚠️ Could not set search_path to public schema:',
          searchPathError.message,
        );
      }

      // Check if migrations have been run by checking for critical tables
      try {
        await this.dataSource!.query('SELECT 1 FROM "users" LIMIT 1');
        await this.dataSource!.query('SELECT 1 FROM "organizations" LIMIT 1');
        this.logger.log(
          '✅ Database connection is healthy and schema is initialized',
        );
      } catch (tableError) {
        if (tableError.message?.includes('does not exist')) {
          this.logger.error(
            '❌ Database tables do not exist - schema needs to be initialized',
          );
          this.logger.warn(
            '💡 REQUIRED: Initialize database schema using the SQL file:',
          );
          this.logger.warn(
            '   Command: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql',
          );
          this.logger.warn(
            '   OR set DB_AUTO_MIGRATE=true in your .env file to use TypeORM migrations',
          );
          throw new Error(
            'Database schema not initialized. Please run the SQL schema file.',
          );
        }
        throw tableError;
      }
    } catch (error) {
      this.logger.error('❌ Database health check failed:', error.message);

      // Specific handling for common database issues
      if (error.message?.includes('typeorm_metadata')) {
        this.logger.warn(
          '💡 Hint: Initialize database schema using the SQL file',
        );
        this.logger.warn(
          '   Command: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql',
        );
      } else if (
        error.message?.includes('database') &&
        error.message?.includes('does not exist')
      ) {
        this.logger.warn(
          '💡 Hint: Create the database first or check DATABASE_NAME',
        );
      } else if (error.message?.includes('connection')) {
        this.logger.warn('💡 Hint: Check database connection settings');
      } else if (
        error.message?.includes('does not exist') &&
        error.message?.includes('relation')
      ) {
        this.logger.warn(
          '💡 Hint: Tables do not exist. Initialize schema using the SQL file',
        );
        this.logger.warn(
          '   Command: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql',
        );
      }

      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.dataSource || !this.dataSource.isInitialized) {
        return false;
      }
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
