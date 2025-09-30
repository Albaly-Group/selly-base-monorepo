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

@Entity('import_jobs')
export class ImportJob {
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
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'validating';

  @Column({ name: 'total_records', type: 'integer', default: 0 })
  totalRecords: number;

  @Column({ name: 'processed_records', type: 'integer', default: 0 })
  processedRecords: number;

  @Column({ name: 'valid_records', type: 'integer', default: 0 })
  validRecords: number;

  @Column({ name: 'error_records', type: 'integer', default: 0 })
  errorRecords: number;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', default: '[]' })
  errors: Array<{ row: number; column?: string; message: string }>;

  @Column({ type: 'jsonb', default: '[]' })
  warnings: Array<{ row: number; column?: string; message: string }>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User;
}