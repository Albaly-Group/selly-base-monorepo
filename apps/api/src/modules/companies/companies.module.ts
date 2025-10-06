import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Companies,
  Organizations,
  Users,
  Companies as Company,
  Organizations as Organization,
  Users as User,
} from '../../entities';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { LeadScoringService } from './lead-scoring.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    // Only import TypeORM features if not skipping database
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [TypeOrmModule.forFeature([Companies, Organizations, Users])]
      : []),
    AuditModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, LeadScoringService],
  exports: [CompaniesService, LeadScoringService],
})
export class CompaniesModule {}
