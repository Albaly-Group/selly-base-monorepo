import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { LeadProjectCompanies } from "./LeadProjectCompanies";
import { LeadProjectTasks } from "./LeadProjectTasks";
import { Organizations } from "./Organizations";
import { Users } from "./Users";

@Index("lead_projects_pkey", ["id"], { unique: true })
@Index("idx_lead_projects_org_status", ["organizationId", "status"], {})
@Index("idx_lead_projects_owner", ["ownerUserId"], {})
@Index("idx_lead_projects_dates", ["startDate", "targetEndDate"], {})
@Entity("lead_projects", { schema: "public" })
export class LeadProjects {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id" })
  organizationId: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "status", nullable: true, default: () => "'draft'" })
  status: string | null;

  @Column("text", {
    name: "priority",
    nullable: true,
    default: () => "'medium'",
  })
  priority: string | null;

  @Column("uuid", { name: "owner_user_id", nullable: true })
  ownerUserId: string | null;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "target_end_date", nullable: true })
  targetEndDate: string | null;

  @Column("date", { name: "actual_end_date", nullable: true })
  actualEndDate: string | null;

  @Column("integer", { name: "target_company_count", nullable: true })
  targetCompanyCount: number | null;

  @Column("integer", { name: "target_contact_count", nullable: true })
  targetContactCount: number | null;

  @Column("integer", { name: "target_meetings", nullable: true })
  targetMeetings: number | null;

  @Column("numeric", {
    name: "target_revenue",
    nullable: true,
    precision: 15,
    scale: 2,
  })
  targetRevenue: string | null;

  @Column("jsonb", { name: "actual_metrics", nullable: true, default: {} })
  actualMetrics: object | null;

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

  @OneToMany(
    () => LeadProjectCompanies,
    (leadProjectCompanies) => leadProjectCompanies.project
  )
  leadProjectCompanies: LeadProjectCompanies[];

  @OneToMany(
    () => LeadProjectTasks,
    (leadProjectTasks) => leadProjectTasks.project
  )
  leadProjectTasks: LeadProjectTasks[];

  @ManyToOne(
    () => Organizations,
    (organizations) => organizations.leadProjects,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.leadProjects, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "owner_user_id", referencedColumnName: "id" }])
  ownerUser: Users;

  @ManyToOne(() => Users, (users) => users.leadProjects2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "pm_user_id", referencedColumnName: "id" }])
  pmUser: Users;

  @ManyToOne(() => Users, (users) => users.leadProjects3, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "team_lead_user_id", referencedColumnName: "id" }])
  teamLeadUser: Users;
}
