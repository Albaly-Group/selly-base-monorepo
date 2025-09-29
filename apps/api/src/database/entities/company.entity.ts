import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('companies')
@Index(['organization_id', 'is_shared_data'])
@Index(['data_source', 'verification_status'])
@Index(['display_name'])
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @Column({ name: 'company_name_en' })
  companyNameEn: string;

  @Column({ name: 'company_name_th', nullable: true })
  companyNameTh?: string;

  @Column({ name: 'company_name_local', nullable: true })
  companyNameLocal?: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'registration_id', nullable: true })
  registrationId?: string;

  @Column({ name: 'duns_number', nullable: true })
  dunsNumber?: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  subdistrict?: string;

  @Column({ name: 'province_detected', nullable: true })
  provinceDetected?: string;

  @Column({ name: 'country_code', nullable: true })
  countryCode?: string;

  @Column({ name: 'business_description', nullable: true })
  businessDescription?: string;

  @Column({ name: 'established_date', nullable: true })
  establishedDate?: Date;

  @Column({ name: 'employee_count_estimate', nullable: true })
  employeeCountEstimate?: number;

  @Column({ 
    name: 'company_size',
    type: 'enum',
    enum: ['micro', 'small', 'medium', 'large', 'enterprise'],
    nullable: true 
  })
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

  @Column({ name: 'annual_revenue_estimate', type: 'numeric', nullable: true })
  annualRevenueEstimate?: number;

  @Column({ name: 'currency_code', nullable: true })
  currencyCode?: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl?: string;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'primary_email', nullable: true })
  primaryEmail?: string;

  @Column({ name: 'primary_phone', nullable: true })
  primaryPhone?: string;

  @Column({ name: 'industry_classification', type: 'jsonb', nullable: true })
  industryClassification?: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  // SaaS-aware data sourcing and privacy
  @Column({ 
    name: 'data_source',
    type: 'enum',
    enum: ['albaly_list', 'dbd_registry', 'customer_input', 'data_enrichment', 'third_party']
  })
  dataSource: 'albaly_list' | 'dbd_registry' | 'customer_input' | 'data_enrichment' | 'third_party';

  @Column({ name: 'source_reference', nullable: true })
  sourceReference?: string;

  @Column({ name: 'is_shared_data', default: false })
  isSharedData: boolean;

  @Column({ 
    name: 'data_sensitivity',
    type: 'enum',
    enum: ['public', 'standard', 'confidential', 'restricted'],
    default: 'standard'
  })
  dataSensitivity: 'public' | 'standard' | 'confidential' | 'restricted';

  @Column({ name: 'data_quality_score', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  dataQualityScore: number;

  @Column({ 
    name: 'verification_status',
    type: 'enum',
    enum: ['verified', 'unverified', 'disputed', 'inactive'],
    default: 'unverified'
  })
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'inactive';

  @Column({ name: 'last_enriched_at', nullable: true })
  lastEnrichedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;
}