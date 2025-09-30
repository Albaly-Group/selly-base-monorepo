import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';

@Module({
  controllers: [ExportsController],
  providers: [],
})
export class ExportsModule {}