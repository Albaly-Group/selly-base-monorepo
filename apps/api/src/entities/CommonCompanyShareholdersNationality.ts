import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonCompanyLists } from "./CommonCompanyLists";

@Index(
  "uq_shareholders_company_year_nat",
  ["asOfYear", "companyId", "nationality"],
  { unique: true }
)
@Index("idx_shareholders_company_year", ["asOfYear", "companyId"], {})
@Index("common_company_shareholders_nationality_pkey", ["id"], { unique: true })
@Entity("common_company_shareholders_nationality", { schema: "public" })
export class CommonCompanyShareholdersNationality {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "company_id" })
  companyId: string;

  @Column("integer", { name: "as_of_year", nullable: true })
  asOfYear: number | null;

  @Column("date", { name: "as_of_date", nullable: true })
  asOfDate: string | null;

  @Column("text", { name: "nationality" })
  nationality: string;

  @Column("numeric", {
    name: "shares",
    nullable: true,
    precision: 20,
    scale: 2,
  })
  shares: string | null;

  @Column("numeric", {
    name: "investment_value_baht",
    nullable: true,
    precision: 20,
    scale: 2,
  })
  investmentValueBaht: string | null;

  @Column("numeric", {
    name: "investment_percent",
    nullable: true,
    precision: 6,
    scale: 2,
  })
  investmentPercent: string | null;

  @Column("text", { name: "source", nullable: true })
  source: string | null;

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
    (commonCompanyLists) =>
      commonCompanyLists.commonCompanyShareholdersNationalities,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;
}
