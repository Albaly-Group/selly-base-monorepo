import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyActivitiesController } from './company-activities.controller';
import { CompanyActivitiesService } from './company-activities.service';
import { UserActivityLogs } from '../../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivityLogs]), AuthModule],
  controllers: [CompanyActivitiesController],
  providers: [CompanyActivitiesService],
  exports: [CompanyActivitiesService],
})
export class CompanyActivitiesModule {}
