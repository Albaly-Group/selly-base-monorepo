import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonCompanyLists } from "./CommonCompanyLists";

@Index("idx_contacts_company", ["companyListId"], {})
@Index("uq_contact_company_phone", ["companyListId", "normPhone"], {
  unique: true,
})
@Index("common_company_contacts_pkey", ["id"], { unique: true })
@Index("uq_contact_email", ["normEmail"], { unique: true })
@Entity("common_company_contacts", { schema: "public" })
export class CommonCompanyContacts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "company_list_id" })
  companyListId: string;

  @Column("text", { name: "first_name", nullable: true })
  firstName: string | null;

  @Column("text", { name: "last_name", nullable: true })
  lastName: string | null;

  @Column("text", { name: "full_name", nullable: true })
  fullName: string | null;

  @Column("text", { name: "title", nullable: true })
  title: string | null;

  @Column("text", { name: "department", nullable: true })
  department: string | null;

  @Column("text", { name: "seniority", nullable: true })
  seniority: string | null;

  @Column("text", { name: "email", nullable: true })
  email: string | null;

  @Column("text", { name: "phone", nullable: true })
  phone: string | null;

  @Column("text", { name: "linkedin_url", nullable: true })
  linkedinUrl: string | null;

  @Column("jsonb", { name: "other_profiles", nullable: true })
  otherProfiles: object | null;

  @Column("text", { name: "source", nullable: true })
  source: string | null;

  @Column("text", { name: "enrichment_provider", nullable: true })
  enrichmentProvider: string | null;

  @Column("numeric", {
    name: "confidence",
    nullable: true,
    precision: 3,
    scale: 2,
  })
  confidence: string | null;

  @Column("timestamp with time zone", { name: "last_verified", nullable: true })
  lastVerified: Date | null;

  @Column("boolean", {
    name: "is_opted_out",
    nullable: true,
    default: () => "false",
  })
  isOptedOut: boolean | null;

  @Column("text", { name: "notes", nullable: true })
  notes: string | null;

  @Column("text", { name: "country_code", nullable: true })
  countryCode: string | null;

  @Column("text", { name: "region", nullable: true })
  region: string | null;

  @Column("text", { name: "city", nullable: true })
  city: string | null;

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

  @Column("text", { name: "norm_email", nullable: true })
  normEmail: string | null;

  @Column("text", { name: "norm_phone", nullable: true })
  normPhone: string | null;

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.commonCompanyContacts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_list_id", referencedColumnName: "id" }])
  companyList: CommonCompanyLists;
}
