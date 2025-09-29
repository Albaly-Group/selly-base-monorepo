import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CompanyList } from './company-list.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('company_list_items')
@Unique(['listId', 'companyId'])
export class CompanyListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'list_id', type: 'uuid' })
  listId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'integer', nullable: true })
  position: number;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ name: 'lead_score', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  leadScore: number;

  @Column({ name: 'score_breakdown', type: 'jsonb', default: {} })
  scoreBreakdown: Record<string, any>;

  @Column({ name: 'score_calculated_at', type: 'timestamptz', nullable: true })
  scoreCalculatedAt: Date;

  @Column({
    type: 'text',
    default: 'new',
    enum: ['new', 'contacted', 'qualified', 'converted', 'rejected'],
  })
  status: string;

  @Column({ name: 'status_changed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  statusChangedAt: Date;

  @Column({ name: 'added_by_user_id', type: 'uuid', nullable: true })
  addedByUserId: string;

  @Column({ name: 'added_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;

  // Relations
  @ManyToOne(() => CompanyList, (list) => list.items)
  @JoinColumn({ name: 'list_id' })
  list: CompanyList;

  @ManyToOne(() => Company, (company) => company.listItems)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by_user_id' })
  addedByUser: User;
}