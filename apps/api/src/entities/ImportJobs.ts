import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Organizations } from './Organizations';
import { Users } from './Users';

@Index('idx_import_jobs_created_at', ['createdAt'], {})
@Index('import_jobs_pkey', ['id'], { unique: true })
@Index('idx_import_jobs_org_status', ['organizationId', 'status'], {})
@Index('idx_import_jobs_uploaded_by', ['uploadedBy'], {})
@Entity('import_jobs', { schema: 'public' })
export class ImportJobs {
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

  @Column('integer', {
    name: 'total_records',
    nullable: true,
    default: () => '0',
  })
  totalRecords: number | null;

  @Column('integer', {
    name: 'processed_records',
    nullable: true,
    default: () => '0',
  })
  processedRecords: number | null;

  @Column('integer', {
    name: 'valid_records',
    nullable: true,
    default: () => '0',
  })
  validRecords: number | null;

  @Column('integer', {
    name: 'error_records',
    nullable: true,
    default: () => '0',
  })
  errorRecords: number | null;

  @Column('uuid', { name: 'uploaded_by', nullable: true })
  uploadedBy: string | null;

  @Column('timestamp with time zone', { name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @Column('jsonb', { name: 'errors', nullable: true, default: [] })
  errors: object | null;

  @Column('jsonb', { name: 'warnings', nullable: true, default: [] })
  warnings: object | null;

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

  @ManyToOne(() => Organizations, (organizations) => organizations.importJobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.importJobs, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'uploaded_by', referencedColumnName: 'id' }])
  uploadedBy2: Users;
}
