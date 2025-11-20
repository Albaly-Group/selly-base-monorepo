import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyRegistrations } from '../../entities/CompanyRegistrations';
import { Companies } from '../../entities/Companies';
import { CompanyRegistrationsController } from './company-registrations.controller';
import { CompanyRegistrationsService } from './company-registrations.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyRegistrations, Companies])],
  controllers: [CompanyRegistrationsController],
  providers: [CompanyRegistrationsService],
  exports: [CompanyRegistrationsService],
})
export class CompanyRegistrationsModule {}
