import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organization } from "./Organization";

@Index("companies_pkey", ["id"], { unique: true })
@Entity("companies", { schema: "public" })
export class Company {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id", nullable: true })
  organizationId: string | null;

  @Column("text", { name: "name_en" })
  nameEn: string;

  @Column("text", { name: "name_th", nullable: true })
  nameTh: string | null;

  @Column("text", { name: "name_local", nullable: true })
  nameLocal: string | null;

  @Column({ type: "text", name: "display_name", insert: false, update: false })
  displayName: string;

  @Column("text", { name: "primary_registration_no", nullable: true })
  primaryRegistrationNo: string | null;

  @Column("text", { name: "registration_country_code", default: () => "'TH'", nullable: true })
  registrationCountryCode: string | null;

  @Column("text", { name: "duns_number", nullable: true })
  dunsNumber: string | null;

  @Column("text", { name: "address_line_1", nullable: true })
  addressLine1: string | null;

  @Column("text", { name: "address_line_2", nullable: true })
  addressLine2: string | null;

  @Column("text", { name: "district", nullable: true })
  district: string | null;

  @Column("text", { name: "subdistrict", nullable: true })
  subdistrict: string | null;

  @Column("text", { name: "province", nullable: true })
  province: string | null;

  @Column("text", { name: "postal_code", nullable: true })
  postalCode: string | null;

  @Column("text", { name: "country_code", default: () => "'TH'", nullable: true })
  countryCode: string | null;

  @Column("decimal", { name: "latitude", precision: 10, scale: 8, nullable: true })
  latitude: string | null;

  @Column("decimal", { name: "longitude", precision: 11, scale: 8, nullable: true })
  longitude: string | null;

  @Column("text", { name: "business_description", nullable: true })
  businessDescription: string | null;

  @Column("date", { name: "established_date", nullable: true })
  establishedDate: string | null;

  @Column("integer", { name: "employee_count_estimate", nullable: true })
  employeeCountEstimate: number | null;

  @Column("text", { name: "company_size", nullable: true })
  companySize: string | null;

  @Column("decimal", { name: "annual_revenue_estimate", precision: 15, scale: 2, nullable: true })
  annualRevenueEstimate: string | null;

  @Column("text", { name: "currency_code", default: () => "'THB'", nullable: true })
  currencyCode: string | null;

  @Column("text", { name: "website_url", nullable: true })
  websiteUrl: string | null;

  @Column("text", { name: "linkedin_url", nullable: true })
  linkedinUrl: string | null;

  @Column("text", { name: "facebook_url", nullable: true })
  facebookUrl: string | null;

  @Column("text", { name: "primary_email", nullable: true })
  primaryEmail: string | null;

  @Column("text", { name: "primary_phone", nullable: true })
  primaryPhone: string | null;

  @Column("text", { name: "logo_url", nullable: true })
  logoUrl: string | null;

  @Column("jsonb", {
    name: "industry_classification",
    default: () => "'{}'",
    nullable: true,
  })
  industryClassification: object | null;

  @Column("text", {
    name: "tags",
    array: true,
    default: () => "'{}'",
    nullable: true,
  })
  tags: string[] | null;

  @Column({
    type: "text",
    name: "search_vector",
    select: false,
    insert: false,
    update: false,
    nullable: true,
  })
  searchVector: any;

  @Column("text", { name: "embedding_vector", nullable: true })
  embeddingVector: string | null;

  @Column("decimal", {
    name: "data_quality_score",
    precision: 3,
    scale: 2,
    default: () => "0.0",
    nullable: true,
  })
  dataQualityScore: number | null;

  @Column("text", {
    name: "data_source",
    default: () => "'customer_input'",
  })
  dataSource: string;

  @Column("text", { name: "source_reference", nullable: true })
  sourceReference: string | null;

  @Column("boolean", {
    name: "is_shared_data",
    default: () => "false",
    nullable: true,
  })
  isSharedData: boolean | null;

  @Column("text", {
    name: "data_sensitivity",
    default: () => "'standard'",
    nullable: true,
  })
  dataSensitivity: string | null;

  @Column("timestamp with time zone", {
    name: "last_enriched_at",
    nullable: true,
  })
  lastEnrichedAt: Date | null;

  @Column("text", {
    name: "verification_status",
    default: () => "'unverified'",
    nullable: true,
  })
  verificationStatus: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column("uuid", { name: "created_by", nullable: true })
  createdBy: string | null;

  @Column("uuid", { name: "updated_by", nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => Organization, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organization;
}
