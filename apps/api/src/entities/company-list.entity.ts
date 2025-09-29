import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { CompanyListItem } from './company-list-item.entity';

@Entity('company_lists')
export class CompanyList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'owner_user_id', type: 'uuid' })
  ownerUserId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: 'private',
    enum: ['private', 'team', 'organization', 'public'],
  })
  visibility: string;

  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared: boolean;

  @Column({ name: 'total_companies', type: 'integer', default: 0 })
  totalCompanies: number;

  @Column({ name: 'last_activity_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  @Column({ name: 'is_smart_list', type: 'boolean', default: false })
  isSmartList: boolean;

  @Column({ name: 'smart_criteria', type: 'jsonb', default: {} })
  smartCriteria: Record<string, any>;

  @Column({ name: 'last_refreshed_at', type: 'timestamptz', nullable: true })
  lastRefreshedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, (organization) => organization.companyLists)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.ownedLists)
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @OneToMany(() => CompanyListItem, (item) => item.list)
  items: CompanyListItem[];
}