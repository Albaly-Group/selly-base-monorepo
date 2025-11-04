import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { FileParserService } from './file-parser.service';
import { TemplateService } from './template.service';
import {
  ImportJobs,
  Organizations,
  Companies,
  ImportJobs as ImportJob,
  Organizations as Organization,
} from '../../entities';

@Module({
  imports: [
    // Only include TypeORM if database is not skipped
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [TypeOrmModule.forFeature([ImportJobs, Organizations, Companies])]
      : []),
  ],
  controllers: [ImportsController],
  providers: [ImportsService, FileParserService, TemplateService],
  exports: [ImportsService],
})
export class ImportsModule {}
