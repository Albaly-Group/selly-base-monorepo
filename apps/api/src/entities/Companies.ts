import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organizations } from './Organizations';
import { CompanyContacts } from './CompanyContacts';
import { CompanyListItems } from './CompanyListItems';
import { CompanyRegistrations } from './CompanyRegistrations';
import { LeadProjectCompanies } from './LeadProjectCompanies';

@Index('idx_companies_size', ['companySize'], {})
@Index('idx_companies_org_source', ['dataSource', 'organizationId'], {})
@Index('companies_pkey', ['id'], { unique: true })
@Index('idx_companies_shared_data', ['isSharedData'], {})
@Index('idx_companies_name_trgm', ['nameEn'], {})
@Index('idx_companies_organization', ['organizationId'], {})
@Index('idx_companies_registration_no', ['primaryRegistrationNo'], {})
@Index('idx_companies_province', ['province'], {})
@Index('idx_companies_search_vector', ['searchVector'], {})
@Index('idx_companies_verification', ['verificationStatus'], {})
@Entity('companies', { schema: 'public' })
export class Companies {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'organization_id', nullable: true })
  organizationId: string | null;

  @Column('text', { name: 'name_en' })
  nameEn: string;

  @Column('text', { name: 'name_th', nullable: true })
  nameTh: string | null;

  @Column('text', { name: 'name_local', nullable: true })
  nameLocal: string | null;

  @Column('text', { name: 'display_name', nullable: true })
  displayName: string | null;

  @Column('text', { name: 'primary_registration_no', nullable: true })
  primaryRegistrationNo: string | null;

  @Column('text', {
    name: 'registration_country_code',
    nullable: true,
    default: () => "'TH'",
  })
  registrationCountryCode: string | null;

  @Column('text', { name: 'duns_number', nullable: true })
  dunsNumber: string | null;

  @Column('text', { name: 'address_line_1', nullable: true })
  addressLine1: string | null;

  @Column('text', { name: 'address_line_2', nullable: true })
  addressLine2: string | null;

  @Column('text', { name: 'district', nullable: true })
  district: string | null;

  @Column('text', { name: 'subdistrict', nullable: true })
  subdistrict: string | null;

  @Column('text', { name: 'province', nullable: true })
  province: string | null;

  @Column('text', { name: 'postal_code', nullable: true })
  postalCode: string | null;

  @Column('text', {
    name: 'country_code',
    nullable: true,
    default: () => "'TH'",
  })
  countryCode: string | null;

  @Column('numeric', {
    name: 'latitude',
    nullable: true,
    precision: 10,
    scale: 8,
  })
  latitude: string | null;

  @Column('numeric', {
    name: 'longitude',
    nullable: true,
    precision: 11,
    scale: 8,
  })
  longitude: string | null;

  @Column('text', { name: 'business_description', nullable: true })
  businessDescription: string | null;

  @Column('date', { name: 'established_date', nullable: true })
  establishedDate: string | null;

  @Column('integer', { name: 'employee_count_estimate', nullable: true })
  employeeCountEstimate: number | null;

  @Column('text', { name: 'company_size', nullable: true })
  companySize: string | null;

  @Column('numeric', {
    name: 'annual_revenue_estimate',
    nullable: true,
    precision: 15,
    scale: 2,
  })
  annualRevenueEstimate: string | null;

  @Column('text', {
    name: 'currency_code',
    nullable: true,
    default: () => "'THB'",
  })
  currencyCode: string | null;

  @Column('text', { name: 'website_url', nullable: true })
  websiteUrl: string | null;

  @Column('text', { name: 'linkedin_url', nullable: true })
  linkedinUrl: string | null;

  @Column('text', { name: 'facebook_url', nullable: true })
  facebookUrl: string | null;

  @Column('text', { name: 'primary_email', nullable: true })
  primaryEmail: string | null;

  @Column('text', { name: 'primary_phone', nullable: true })
  primaryPhone: string | null;

  @Column('text', { name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column('jsonb', {
    name: 'industry_classification',
    nullable: true,
    default: {},
  })
  industryClassification: object | null;

  @Column('text', {
    name: 'tags',
    nullable: true,
    array: true,
    default: () => "'{}'[]",
  })
  tags: string[] | null;

  @Column('tsvector', { name: 'search_vector', nullable: true })
  searchVector: string | null;

  @Column('text', { name: 'embedding_vector', nullable: true })
  embeddingVector: string | null;

  @Column('numeric', {
    name: 'data_quality_score',
    nullable: true,
    precision: 3,
    scale: 2,
    default: () => '0.0',
  })
  dataQualityScore: string | null;

  @Column('text', { name: 'data_source', default: () => "'customer_input'" })
  dataSource: string;

  @Column('text', { name: 'source_reference', nullable: true })
  sourceReference: string | null;

  @Column('boolean', {
    name: 'is_shared_data',
    nullable: true,
    default: () => 'false',
  })
  isSharedData: boolean | null;

  @Column('text', {
    name: 'data_sensitivity',
    nullable: true,
    default: () => "'standard'",
  })
  dataSensitivity: string | null;

  @Column('timestamp with time zone', {
    name: 'last_enriched_at',
    nullable: true,
  })
  lastEnrichedAt: Date | null;

  @Column('text', {
    name: 'verification_status',
    nullable: true,
    default: () => "'unverified'",
  })
  verificationStatus: string | null;

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

  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column('uuid', { name: 'updated_by', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => Organizations, (organizations) => organizations.companies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;

  @OneToMany(
    () => CompanyContacts,
    (companyContacts) => companyContacts.company,
  )
  companyContacts: CompanyContacts[];

  @OneToMany(
    () => CompanyListItems,
    (companyListItems) => companyListItems.company,
  )
  companyListItems: CompanyListItems[];

  @OneToMany(
    () => CompanyRegistrations,
    (companyRegistrations) => companyRegistrations.company,
  )
  companyRegistrations: CompanyRegistrations[];

  @OneToMany(
    () => LeadProjectCompanies,
    (leadProjectCompanies) => leadProjectCompanies.company,
  )
  leadProjectCompanies: LeadProjectCompanies[];
}
