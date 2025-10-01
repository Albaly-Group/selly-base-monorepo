import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Companies } from "./Companies";

@Index("idx_contacts_company", ["companyId"], {})
@Index("idx_contacts_email", ["email"], {})
@Index("company_contacts_pkey", ["id"], { unique: true })
@Entity("company_contacts", { schema: "public" })
export class CompanyContacts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "company_id" })
  companyId: string;

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

  @Column("text", { name: "seniority_level", nullable: true })
  seniorityLevel: string | null;

  @Column("text", { name: "email", nullable: true })
  email: string | null;

  @Column("text", { name: "phone", nullable: true })
  phone: string | null;

  @Column("text", { name: "linkedin_url", nullable: true })
  linkedinUrl: string | null;

  @Column("numeric", {
    name: "confidence_score",
    nullable: true,
    precision: 3,
    scale: 2,
    default: () => "0.0",
  })
  confidenceScore: string | null;

  @Column("timestamp with time zone", {
    name: "last_verified_at",
    nullable: true,
  })
  lastVerifiedAt: Date | null;

  @Column("text", { name: "verification_method", nullable: true })
  verificationMethod: string | null;

  @Column("boolean", {
    name: "is_opted_out",
    nullable: true,
    default: () => "false",
  })
  isOptedOut: boolean | null;

  @Column("timestamp with time zone", { name: "opt_out_date", nullable: true })
  optOutDate: Date | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(() => Companies, (companies) => companies.companyContacts, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: Companies;
}
