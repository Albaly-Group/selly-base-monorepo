import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('export_jobs')
export class ExportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @Column({ type: 'text' })
  filename: string;

  @Column({ 
    type: 'text',
    default: 'queued'
  })
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'text', default: 'CSV' })
  format: 'CSV' | 'Excel' | 'JSON';

  @Column({ name: 'total_records', type: 'integer', default: 0 })
  totalRecords: number;

  @Column({ name: 'file_size', type: 'text', nullable: true })
  fileSize: string;

  @Column({ name: 'download_url', type: 'text', nullable: true })
  downloadUrl: string;

  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requestedByUser: User;
}