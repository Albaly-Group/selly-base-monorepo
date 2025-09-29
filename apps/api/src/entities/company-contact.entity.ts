import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('company_contacts')
export class CompanyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  department: string;

  @Column({
    name: 'seniority_level',
    type: 'text',
    nullable: true,
    enum: ['ic', 'manager', 'director', 'vp', 'c_level', 'founder'],
  })
  seniorityLevel: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({ name: 'linkedin_url', type: 'text', nullable: true })
  linkedinUrl: string;

  @Column({
    name: 'confidence_score',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  confidenceScore: number;

  @Column({ name: 'last_verified_at', type: 'timestamptz', nullable: true })
  lastVerifiedAt: Date;

  @Column({ name: 'verification_method', type: 'text', nullable: true })
  verificationMethod: string;

  @Column({ name: 'is_opted_out', type: 'boolean', default: false })
  isOptedOut: boolean;

  @Column({ name: 'opt_out_date', type: 'timestamptz', nullable: true })
  optOutDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.contacts)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
