import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Companies } from "./Companies";
import { LeadProjects } from "./LeadProjects";
import { CompanyLists } from "./CompanyLists";

@Index(
  "lead_project_companies_project_id_company_id_key",
  ["companyId", "projectId"],
  { unique: true }
)
@Index("lead_project_companies_pkey", ["id"], { unique: true })
@Entity("lead_project_companies", { schema: "public" })
export class LeadProjectCompanies {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "project_id", unique: true })
  projectId: string;

  @Column("uuid", { name: "company_id", unique: true })
  companyId: string;

  @Column("text", { name: "source_method", nullable: true })
  sourceMethod: string | null;

  @Column("text", { name: "source_description", nullable: true })
  sourceDescription: string | null;

  @Column("numeric", {
    name: "priority_score",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "0.0",
  })
  priorityScore: string | null;

  @Column("text", {
    name: "status",
    nullable: true,
    default: () => "'pending'",
  })
  status: string | null;

  @Column("text", { name: "notes", nullable: true })
  notes: string | null;

  @Column("jsonb", { name: "custom_fields", nullable: true, default: {} })
  customFields: object | null;

  @Column("timestamp with time zone", {
    name: "added_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  addedAt: Date | null;

  @ManyToOne(() => Users, (users) => users.leadProjectCompanies, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "added_by_user_id", referencedColumnName: "id" }])
  addedByUser: Users;

  @ManyToOne(() => Users, (users) => users.leadProjectCompanies2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "assigned_to_user_id", referencedColumnName: "id" }])
  assignedToUser: Users;

  @ManyToOne(() => Companies, (companies) => companies.leadProjectCompanies, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: Companies;

  @ManyToOne(
    () => LeadProjects,
    (leadProjects) => leadProjects.leadProjectCompanies,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadProjects;

  @ManyToOne(
    () => CompanyLists,
    (companyLists) => companyLists.leadProjectCompanies,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "source_list_id", referencedColumnName: "id" }])
  sourceList: CompanyLists;
}
