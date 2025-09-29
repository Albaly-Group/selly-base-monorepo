import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  domain?: string;

  @Column({ 
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active' 
  })
  status: 'active' | 'inactive' | 'suspended';

  @Column({ 
    type: 'enum',
    enum: ['basic', 'professional', 'enterprise'],
    nullable: true 
  })
  subscription_tier?: 'basic' | 'professional' | 'enterprise';

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}