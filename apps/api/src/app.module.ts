import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyListsModule } from './modules/company-lists/company-lists.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Create conditional imports at module load time
const getImports = () => {
  const baseImports: any[] = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    CompaniesModule,
    CompanyListsModule,
    AuthModule,
    AuditModule,
  ];

  // Only add TypeORM if not skipping database
  if (process.env.SKIP_DATABASE?.toLowerCase() !== 'true') {
    baseImports.splice(
      1,
      0,
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const dbConfig = configService.get('database');
          if (!dbConfig) {
            throw new Error('Database configuration not found');
          }
          return dbConfig;
        },
      }),
    );
  }

  return baseImports;
};

@Module({
  imports: getImports(),
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
