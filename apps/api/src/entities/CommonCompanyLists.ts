import { Column, Entity, Index, OneToMany, OneToOne } from "typeorm";
import { Clients } from "./Clients";
import { CommonCompanyClassifications } from "./CommonCompanyClassifications";
import { CommonCompanyContacts } from "./CommonCompanyContacts";
import { CommonCompanyRegistrations } from "./CommonCompanyRegistrations";
import { CommonCompanyShareholdersNationality } from "./CommonCompanyShareholdersNationality";
import { CommonCompanyTags } from "./CommonCompanyTags";
import { LeadListingProjectCompanies } from "./LeadListingProjectCompanies";
import { Leads } from "./Leads";

@Index("idx_company_trgm_name", ["companyNameEn"], {})
@Index("common_company_lists_pkey", ["id"], { unique: true })
@Index("uq_company_name_when_no_reg", ["normCompanyNameEn"], { unique: true })
@Index("idx_company_registration", ["normRegisteredId"], {})
@Index("uq_company_regid", ["normRegisteredId"], { unique: true })
@Index("idx_company_province", ["provinceDetected"], {})
@Entity("common_company_lists", { schema: "public" })
export class CommonCompanyLists {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "company_name_en" })
  companyNameEn: string;

  @Column("text", { name: "company_name_th", nullable: true })
  companyNameTh: string | null;

  @Column("text", { name: "registration_id", nullable: true })
  registrationId: string | null;

  @Column("text", { name: "duns_number", nullable: true })
  dunsNumber: string | null;

  @Column("text", { name: "address_line", nullable: true })
  addressLine: string | null;

  @Column("text", { name: "district", nullable: true })
  district: string | null;

  @Column("text", { name: "amphoe", nullable: true })
  amphoe: string | null;

  @Column("text", { name: "province_raw", nullable: true })
  provinceRaw: string | null;

  @Column("text", { name: "province_detected", nullable: true })
  provinceDetected: string | null;

  @Column("numeric", { name: "province_confidence", nullable: true })
  provinceConfidence: string | null;

  @Column("text", { name: "province_source", nullable: true })
  provinceSource: string | null;

  @Column("text", { name: "country_code", nullable: true })
  countryCode: string | null;

  @Column("jsonb", { name: "geo_metadata", nullable: true })
  geoMetadata: object | null;

  @Column("text", { name: "business_type_text", nullable: true })
  businessTypeText: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("jsonb", { name: "financials", nullable: true })
  financials: object | null;

  @Column("text", { name: "website", nullable: true })
  website: string | null;

  @Column("text", { name: "linkedin_url", nullable: true })
  linkedinUrl: string | null;

  @Column("text", { name: "logo_url", nullable: true })
  logoUrl: string | null;

  @Column("text", { name: "tel", nullable: true })
  tel: string | null;

  @Column("text", { name: "email", nullable: true })
  email: string | null;

  @Column("text", { name: "source", nullable: true, array: true })
  source: string[] | null;

  @Column("USER-DEFINED", { name: "vector_embedding", nullable: true })
  vectorEmbedding: string | null;

  @Column("text", { name: "main_shareholder_nationality", nullable: true })
  mainShareholderNationality: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("timestamp with time zone", { name: "last_updated", nullable: true })
  lastUpdated: Date | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @Column("text", { name: "norm_registered_id", nullable: true })
  normRegisteredId: string | null;

  @Column("text", { name: "norm_company_name_en", nullable: true })
  normCompanyNameEn: string | null;

  @OneToMany(() => Clients, (clients) => clients.company)
  clients: Clients[];

  @OneToMany(
    () => CommonCompanyClassifications,
    (commonCompanyClassifications) => commonCompanyClassifications.company
  )
  commonCompanyClassifications: CommonCompanyClassifications[];

  @OneToMany(
    () => CommonCompanyContacts,
    (commonCompanyContacts) => commonCompanyContacts.companyList
  )
  commonCompanyContacts: CommonCompanyContacts[];

  @OneToOne(
    () => CommonCompanyRegistrations,
    (commonCompanyRegistrations) => commonCompanyRegistrations.company
  )
  commonCompanyRegistrations: CommonCompanyRegistrations;

  @OneToMany(
    () => CommonCompanyShareholdersNationality,
    (commonCompanyShareholdersNationality) =>
      commonCompanyShareholdersNationality.company
  )
  commonCompanyShareholdersNationalities: CommonCompanyShareholdersNationality[];

  @OneToMany(
    () => CommonCompanyTags,
    (commonCompanyTags) => commonCompanyTags.company
  )
  commonCompanyTags: CommonCompanyTags[];

  @OneToMany(
    () => LeadListingProjectCompanies,
    (leadListingProjectCompanies) => leadListingProjectCompanies.companyList
  )
  leadListingProjectCompanies: LeadListingProjectCompanies[];

  @OneToMany(() => Leads, (leads) => leads.company)
  leads: Leads[];
}
