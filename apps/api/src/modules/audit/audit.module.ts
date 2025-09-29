import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, User, Organization } from '../../entities';
import { AuditService } from './audit.service';

@Module({
  imports: [
    ...(process.env.SKIP_DATABASE !== 'true' ? [
      TypeOrmModule.forFeature([AuditLog, User, Organization])
    ] : [])
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}