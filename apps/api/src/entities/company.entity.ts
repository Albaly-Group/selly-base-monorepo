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
import { CompanyContact } from './company-contact.entity';
import { CompanyListItem } from './company-list-item.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @Column({ name: 'name_en', type: 'text' })
  nameEn: string;

  @Column({ name: 'name_th', type: 'text', nullable: true })
  nameTh: string;

  @Column({ name: 'name_local', type: 'text', nullable: true })
  nameLocal: string;

  // Generated column in database: COALESCE(name_en, name_th)
  @Column({ name: 'display_name', type: 'text', insert: false, update: false })
  displayName: string;

  @Column({ name: 'primary_registration_no', type: 'text', nullable: true })
  primaryRegistrationNo: string;

  @Column({ name: 'registration_country_code', type: 'text', default: 'TH' })
  registrationCountryCode: string;

  @Column({ name: 'duns_number', type: 'text', nullable: true })
  dunsNumber: string;

  @Column({ name: 'address_line_1', type: 'text', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line_2', type: 'text', nullable: true })
  addressLine2: string;

  @Column({ type: 'text', nullable: true })
  district: string;

  @Column({ type: 'text', nullable: true })
  subdistrict: string;

  @Column({ type: 'text', nullable: true })
  province: string;

  @Column({ name: 'postal_code', type: 'text', nullable: true })
  postalCode: string;

  @Column({ name: 'country_code', type: 'text', default: 'TH' })
  countryCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription: string;

  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ name: 'employee_count_estimate', type: 'integer', nullable: true })
  employeeCountEstimate: number;

  @Column({
    name: 'company_size',
    type: 'text',
    nullable: true,
    enum: ['micro', 'small', 'medium', 'large', 'enterprise'],
  })
  companySize: string;

  @Column({
    name: 'annual_revenue_estimate',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  annualRevenueEstimate: number;

  @Column({ name: 'currency_code', type: 'text', default: 'THB' })
  currencyCode: string;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string;

  @Column({ name: 'linkedin_url', type: 'text', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'facebook_url', type: 'text', nullable: true })
  facebookUrl: string;

  @Column({ name: 'primary_email', type: 'text', nullable: true })
  primaryEmail: string;

  @Column({ name: 'primary_phone', type: 'text', nullable: true })
  primaryPhone: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'industry_classification', type: 'jsonb', default: {} })
  industryClassification: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  // Generated column in database: to_tsvector('english', name_en || ' ' || business_description)
  @Column({ name: 'search_vector', type: 'tsvector', select: false, insert: false, update: false, nullable: true })
  searchVector: any;

  // Vector embedding for semantic search (pgvector extension)
  @Column({ name: 'embedding_vector', type: 'text', nullable: true })
  embeddingVector: string;

  @Column({
    name: 'data_quality_score',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  dataQualityScore: number;

  @Column({
    name: 'data_source',
    type: 'text',
    default: 'customer_input',
    enum: [
      'albaly_list',
      'dbd_registry',
      'customer_input',
      'data_enrichment',
      'third_party',
    ],
  })
  dataSource: string;

  @Column({ name: 'source_reference', type: 'text', nullable: true })
  sourceReference: string;

  @Column({ name: 'is_shared_data', type: 'boolean', default: false })
  isSharedData: boolean;

  @Column({
    name: 'data_sensitivity',
    type: 'text',
    default: 'standard',
    enum: ['public', 'standard', 'confidential', 'restricted'],
  })
  dataSensitivity: string;

  @Column({ name: 'last_enriched_at', type: 'timestamptz', nullable: true })
  lastEnrichedAt: Date;

  @Column({
    name: 'verification_status',
    type: 'text',
    default: 'unverified',
    enum: ['verified', 'unverified', 'disputed', 'inactive'],
  })
  verificationStatus: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  // Relations
  @ManyToOne(() => Organization, (organization) => organization.companies)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => CompanyContact, (contact) => contact.company)
  contacts: CompanyContact[];

  @OneToMany(() => CompanyListItem, (listItem) => listItem.company)
  listItems: CompanyListItem[];
}
