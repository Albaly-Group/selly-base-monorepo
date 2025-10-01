import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Users } from "./Users";
import { LeadListingProjects } from "./LeadListingProjects";
import { LeadListingTimelogs } from "./LeadListingTimelogs";

@Index("uq_lead_listing_one_active_task_per_user", ["assignedUserId"], {
  unique: true,
})
@Index("lead_listing_tasks_pkey", ["id"], { unique: true })
@Entity("lead_listing_tasks", { schema: "public" })
export class LeadListingTasks {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("jsonb", { name: "spec_json" })
  specJson: object;

  @Column("integer", { name: "target_count" })
  targetCount: number;

  @Column("date", { name: "deadline", nullable: true })
  deadline: string | null;

  @Column("integer", { name: "priority", nullable: true, default: () => "3" })
  priority: number | null;

  @Column("uuid", { name: "assigned_user_id" })
  assignedUserId: string;

  @Column("text", { name: "status", default: () => "'assigned'" })
  status: string;

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

  @OneToOne(() => Users, (users) => users.leadListingTasks)
  @JoinColumn([{ name: "assigned_user_id", referencedColumnName: "id" }])
  assignedUser: Users;

  @ManyToOne(() => Users, (users) => users.leadListingTasks2)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.leadListingTasks,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadListingProjects;

  @OneToMany(
    () => LeadListingTimelogs,
    (leadListingTimelogs) => leadListingTimelogs.task
  )
  leadListingTimelogs: LeadListingTimelogs[];
}
