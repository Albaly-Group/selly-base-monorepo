import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogs, Users, Organizations, AuditLogs as AuditLog, Users as User, Organizations as Organization } from '../../entities';
import { AuditService } from './audit.service';

@Module({
  imports: [
    ...(process.env.SKIP_DATABASE?.toLowerCase() !== 'true'
      ? [TypeOrmModule.forFeature([AuditLogs, Users, Organizations])]
      : []),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
