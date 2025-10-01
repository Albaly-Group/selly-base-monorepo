import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Organizations } from './Organizations';
import { Users } from './Users';

@Index('idx_export_jobs_created_at', ['createdAt'], {})
@Index('idx_export_jobs_expires_at', ['expiresAt'], {})
@Index('export_jobs_pkey', ['id'], { unique: true })
@Index('idx_export_jobs_org_status', ['organizationId', 'status'], {})
@Index('idx_export_jobs_requested_by', ['requestedBy'], {})
@Entity('export_jobs', { schema: 'public' })
export class ExportJobs {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'organization_id', nullable: true })
  organizationId: string | null;

  @Column('text', { name: 'filename' })
  filename: string;

  @Column('text', { name: 'status', default: () => "'queued'" })
  status: string;

  @Column('text', { name: 'scope', nullable: true })
  scope: string | null;

  @Column('text', { name: 'format', default: () => "'CSV'" })
  format: string;

  @Column('integer', {
    name: 'total_records',
    nullable: true,
    default: () => '0',
  })
  totalRecords: number | null;

  @Column('text', { name: 'file_size', nullable: true })
  fileSize: string | null;

  @Column('text', { name: 'download_url', nullable: true })
  downloadUrl: string | null;

  @Column('uuid', { name: 'requested_by', nullable: true })
  requestedBy: string | null;

  @Column('timestamp with time zone', { name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @Column('timestamp with time zone', { name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column('jsonb', { name: 'metadata', nullable: true, default: {} })
  metadata: object | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @ManyToOne(() => Organizations, (organizations) => organizations.exportJobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.exportJobs, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'requested_by', referencedColumnName: 'id' }])
  requestedBy2: Users;
}
