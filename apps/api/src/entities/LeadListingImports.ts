import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { LeadListingImportRows } from "./LeadListingImportRows";
import { LeadListingProjects } from "./LeadListingProjects";
import { Users } from "./Users";

@Index("lead_listing_imports_pkey", ["id"], { unique: true })
@Entity("lead_listing_imports", { schema: "public" })
export class LeadListingImports {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "file_path" })
  filePath: string;

  @Column("text", { name: "status", default: () => "'uploaded'" })
  status: string;

  @Column("jsonb", { name: "column_map", nullable: true })
  columnMap: object | null;

  @Column("jsonb", { name: "summary_json", nullable: true })
  summaryJson: object | null;

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

  @OneToMany(
    () => LeadListingImportRows,
    (leadListingImportRows) => leadListingImportRows.import
  )
  leadListingImportRows: LeadListingImportRows[];

  @ManyToOne(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.leadListingImports
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadListingProjects;

  @ManyToOne(() => Users, (users) => users.leadListingImports)
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedBy: Users;
}
