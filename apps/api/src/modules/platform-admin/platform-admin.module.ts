import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { Organizations, Users, Companies } from '../../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organizations, Users, Companies]),
    AuthModule,
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
  exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
