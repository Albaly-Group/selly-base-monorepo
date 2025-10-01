import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { LeadListingImports } from "./LeadListingImports";
import { LeadListingProjectCompanies } from "./LeadListingProjectCompanies";
import { Users } from "./Users";
import { LeadListingTasks } from "./LeadListingTasks";
import { LeadListingTimelogs } from "./LeadListingTimelogs";

@Index("lead_listing_projects_pkey", ["id"], { unique: true })
@Entity("lead_listing_projects", { schema: "public" })
export class LeadListingProjects {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "status" })
  status: string;

  @Column("numeric", {
    name: "mrr",
    nullable: true,
    precision: 18,
    scale: 2,
    default: () => "0",
  })
  mrr: string | null;

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
    () => LeadListingImports,
    (leadListingImports) => leadListingImports.project
  )
  leadListingImports: LeadListingImports[];

  @OneToMany(
    () => LeadListingProjectCompanies,
    (leadListingProjectCompanies) => leadListingProjectCompanies.project
  )
  leadListingProjectCompanies: LeadListingProjectCompanies[];

  @ManyToOne(() => Users, (users) => users.leadListingProjects)
  @JoinColumn([{ name: "pm_id", referencedColumnName: "id" }])
  pm: Users;

  @ManyToOne(() => Users, (users) => users.leadListingProjects2)
  @JoinColumn([{ name: "tl_id", referencedColumnName: "id" }])
  tl: Users;

  @OneToMany(
    () => LeadListingTasks,
    (leadListingTasks) => leadListingTasks.project
  )
  leadListingTasks: LeadListingTasks[];

  @OneToMany(
    () => LeadListingTimelogs,
    (leadListingTimelogs) => leadListingTimelogs.project
  )
  leadListingTimelogs: LeadListingTimelogs[];
}
