import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceDataController } from './reference-data.controller';
import { ReferenceDataService } from './reference-data.service';
import { RefIndustryCodes, RefRegions, RefTags } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([RefIndustryCodes, RefRegions, RefTags])],
  controllers: [ReferenceDataController],
  providers: [ReferenceDataService],
  exports: [ReferenceDataService],
})
export class ReferenceDataModule {}
