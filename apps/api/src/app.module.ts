import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyListsModule } from './modules/company-lists/company-lists.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { ExportsModule } from './modules/exports/exports.module';
import { ImportsModule } from './modules/imports/imports.module';
import { StaffModule } from './modules/staff/staff.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReferenceDataModule } from './modules/reference-data/reference-data.module';
import { CompanyContactsModule } from './modules/company-contacts/company-contacts.module';
import { CompanyActivitiesModule } from './modules/company-activities/company-activities.module';
import { DatabaseHealthService } from './database/database-health.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Create conditional imports and providers at module load time
const getImports = () => {
  const baseImports: any[] = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    AuthModule,
    AuditModule,
    CompaniesModule,
    CompanyListsModule,
    ExportsModule,
    ImportsModule,
    StaffModule,
    ReportsModule,
    AdminModule,
    ReferenceDataModule,
    CompanyContactsModule,
    CompanyActivitiesModule,
  ];

  // Only add TypeORM if not skipping database
  if (process.env.SKIP_DATABASE?.toLowerCase() !== 'true') {
    baseImports.splice(
      1,
      0,
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const dbConfig = configService.get('database');
          if (!dbConfig) {
            throw new Error('Database configuration not found');
          }

          console.log(
            `🔧 Database configuration loaded for: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`,
          );

          return {
            ...dbConfig,
            // Add connection event handlers for better debugging
            extra: {
              ...dbConfig.extra,
              // Add query timeout
              statement_timeout: 30000,
            },
          };
        },
      }),
    );
  }

  return baseImports;
};

@Module({
  imports: getImports(),
  controllers: [AppController],
  providers: [AppService, DatabaseHealthService],
})
export class AppModule {}
