import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyContactsController } from './company-contacts.controller';
import { CompanyContactsService } from './company-contacts.service';
import { CompanyContacts } from '../../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyContacts]), AuthModule],
  controllers: [CompanyContactsController],
  providers: [CompanyContactsService],
  exports: [CompanyContactsService],
})
export class CompanyContactsModule {}
