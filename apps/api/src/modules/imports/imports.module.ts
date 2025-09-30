import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';

@Module({
  controllers: [ImportsController],
  providers: [],
})
export class ImportsModule {}