import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { CompanyList } from './company-list.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  domain: string;

  @Column({
    type: 'text',
    default: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  status: string;

  @Column({
    name: 'subscription_tier',
    type: 'text',
    default: 'basic',
    enum: ['basic', 'professional', 'enterprise'],
  })
  subscriptionTier: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Company, (company) => company.organization)
  companies: Company[];

  @OneToMany(() => CompanyList, (list) => list.organization)
  companyLists: CompanyList[];
}