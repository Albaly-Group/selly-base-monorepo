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
    if (this.configService.get('SKIP_DATABASE')?.toLowerCase() === 'true') {
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
      this.logger.log('✅ Database connection is healthy');
    } catch (error) {
      this.logger.error('❌ Database health check failed:', error.message);
      
      // Specific handling for common database issues
      if (error.message?.includes('typeorm_metadata')) {
        this.logger.warn('💡 Hint: Run migrations to initialize database schema');
        this.logger.warn('   Command: npm run migration:run');
      } else if (error.message?.includes('database') && error.message?.includes('does not exist')) {
        this.logger.warn('💡 Hint: Create the database first or check DATABASE_NAME');
      } else if (error.message?.includes('connection')) {
        this.logger.warn('💡 Hint: Check database connection settings');
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