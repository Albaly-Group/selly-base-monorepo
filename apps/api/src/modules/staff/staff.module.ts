import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { User, Role, UserRole, Organization } from '../../entities';

@Module({
  imports: [
    // Only include TypeORM if database is not skipped
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true' 
      ? [TypeOrmModule.forFeature([User, Role, UserRole, Organization])]
      : []
    ),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}