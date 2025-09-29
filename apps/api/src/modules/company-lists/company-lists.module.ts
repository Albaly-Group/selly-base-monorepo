import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyList, CompanyListItem, Company, User } from '../../entities';
import { CompanyListsService } from './company-lists.service';
import { CompanyListsController } from './company-lists.controller';

@Module({
  imports: [
    // Only import TypeORM features if not skipping database
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true' ? [
      TypeOrmModule.forFeature([CompanyList, CompanyListItem, Company, User])
    ] : [])
  ],
  controllers: [CompanyListsController],
  providers: [CompanyListsService],
  exports: [CompanyListsService],
})
export class CompanyListsModule {}