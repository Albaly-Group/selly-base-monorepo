import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import {
  Users,
  Roles,
  UserRoles,
  Organizations,
  Users as User,
  Roles as Role,
  UserRoles as UserRole,
  Organizations as Organization,
} from '../../entities';

@Module({
  imports: [
    // Only include TypeORM if database is not skipped
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [TypeOrmModule.forFeature([Users, Roles, UserRoles, Organizations])]
      : []),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
