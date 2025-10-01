import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CommonCompanyLists } from "./CommonCompanyLists";
import { Users } from "./Users";
import { LeadListingProjects } from "./LeadListingProjects";

@Index(
  "lead_listing_project_companies_project_id_company_list_id_key",
  ["companyListId", "projectId"],
  { unique: true }
)
@Index("lead_listing_project_companies_pkey", ["id"], { unique: true })
@Entity("lead_listing_project_companies", { schema: "public" })
export class LeadListingProjectCompanies {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "project_id", unique: true })
  projectId: string;

  @Column("uuid", { name: "company_list_id", unique: true })
  companyListId: string;

  @Column("text", { name: "method" })
  method: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.leadListingProjectCompanies,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_list_id", referencedColumnName: "id" }])
  companyList: CommonCompanyLists;

  @ManyToOne(() => Users, (users) => users.leadListingProjectCompanies)
  @JoinColumn([{ name: "contributor_id", referencedColumnName: "id" }])
  contributor: Users;

  @ManyToOne(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.leadListingProjectCompanies,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadListingProjects;
}
