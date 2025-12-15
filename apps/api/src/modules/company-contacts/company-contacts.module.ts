import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyContactsController } from './company-contacts.controller';
import { CompanyContactsService } from './company-contacts.service';
import { CompanyContacts, Companies } from '../../entities';
import { AuthModule } from '../auth/auth.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyContacts, Companies]),
    AuthModule,
    forwardRef(() => CompaniesModule),
  ],
  controllers: [CompanyContactsController],
  providers: [CompanyContactsService],
  exports: [CompanyContactsService],
})
export class CompanyContactsModule {}
