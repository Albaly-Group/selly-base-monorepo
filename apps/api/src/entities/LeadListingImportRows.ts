import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { LeadListingImports } from "./LeadListingImports";

@Index("lead_listing_import_rows_pkey", ["id"], { unique: true })
@Index("idx_lead_listing_import_rows_import_id", ["importId"], {})
@Entity("lead_listing_import_rows", { schema: "public" })
export class LeadListingImportRows {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "import_id" })
  importId: string;

  @Column("integer", { name: "row_index" })
  rowIndex: number;

  @Column("jsonb", { name: "raw_json" })
  rawJson: object;

  @Column("jsonb", { name: "parsed_json", nullable: true })
  parsedJson: object | null;

  @Column("jsonb", { name: "dedupe_hint", nullable: true })
  dedupeHint: object | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => LeadListingImports,
    (leadListingImports) => leadListingImports.leadListingImportRows,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "import_id", referencedColumnName: "id" }])
  import: LeadListingImports;
}
