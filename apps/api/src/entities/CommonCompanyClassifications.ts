import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonCompanyLists } from "./CommonCompanyLists";
import { RefTsic_2009 } from "./RefTsic_2009";

@Index("idx_company_classifications_company", ["companyId"], {})
@Index("common_company_classifications_pkey", ["id"], { unique: true })
@Index("idx_company_classifications_tsic", ["tsicCode"], {})
@Entity("common_company_classifications", { schema: "public" })
export class CommonCompanyClassifications {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "company_id" })
  companyId: string;

  @Column("enum", {
    name: "source",
    enum: ["dbd_registration", "dbd_latest_filing", "manual", "other_registry"],
  })
  source:
    | "dbd_registration"
    | "dbd_latest_filing"
    | "manual"
    | "other_registry";

  @Column("text", { name: "tsic_code", nullable: true })
  tsicCode: string | null;

  @Column("text", { name: "business_type_text", nullable: true })
  businessTypeText: string | null;

  @Column("text", { name: "objective_text", nullable: true })
  objectiveText: string | null;

  @Column("date", { name: "effective_date", nullable: true })
  effectiveDate: string | null;

  @Column("integer", { name: "filing_year", nullable: true })
  filingYear: number | null;

  @Column("boolean", {
    name: "is_primary",
    nullable: true,
    default: () => "false",
  })
  isPrimary: boolean | null;

  @Column("jsonb", { name: "raw_payload", nullable: true })
  rawPayload: object | null;

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

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.commonCompanyClassifications,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;

  @ManyToOne(
    () => RefTsic_2009,
    (refTsic_2009) => refTsic_2009.commonCompanyClassifications
  )
  @JoinColumn([{ name: "tsic_code", referencedColumnName: "activityCode" }])
  tsicCode2: RefTsic_2009;
}
