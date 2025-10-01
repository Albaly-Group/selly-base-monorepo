import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CompanyLists,
  CompanyListItems,
  Companies,
  Users,
  CompanyLists as CompanyList,
  CompanyListItems as CompanyListItem,
  Companies as Company,
  Users as User,
} from '../../entities';
import { CompanyListsService } from './company-lists.service';
import { CompanyListsController } from './company-lists.controller';

@Module({
  imports: [
    // Only import TypeORM features if not skipping database
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [
          TypeOrmModule.forFeature([
            CompanyLists,
            CompanyListItems,
            Companies,
            Users,
          ]),
        ]
      : []),
  ],
  controllers: [CompanyListsController],
  providers: [CompanyListsService],
  exports: [CompanyListsService],
})
export class CompanyListsModule {}
