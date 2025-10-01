import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import {
  ImportJobs,
  Organizations,
  ImportJobs as ImportJob,
  Organizations as Organization,
} from '../../entities';

@Module({
  imports: [
    // Only include TypeORM if database is not skipped
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [TypeOrmModule.forFeature([ImportJobs, Organizations])]
      : []),
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
  exports: [ImportsService],
})
export class ImportsModule {}
