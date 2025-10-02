import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import {
  Companies,
  CompanyLists,
  ExportJobs,
  ImportJobs,
  Users,
  AuditLogs,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Companies,
      CompanyLists,
      ExportJobs,
      ImportJobs,
      Users,
      AuditLogs,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
