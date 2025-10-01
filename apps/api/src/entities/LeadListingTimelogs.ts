import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { LeadListingProjects } from "./LeadListingProjects";
import { LeadListingTasks } from "./LeadListingTasks";
import { Users } from "./Users";

@Index("lead_listing_timelogs_pkey", ["id"], { unique: true })
@Index("idx_lead_listing_timelogs_project", ["projectId"], {})
@Index("idx_lead_listing_timelogs_task", ["taskId"], {})
@Index("uq_lead_listing_one_open_timelog_per_user", ["userId"], {
  unique: true,
})
@Entity("lead_listing_timelogs", { schema: "public" })
export class LeadListingTimelogs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "task_id" })
  taskId: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("uuid", { name: "project_id" })
  projectId: string;

  @Column("text", { name: "activity" })
  activity: string;

  @Column("timestamp with time zone", {
    name: "started_at",
    default: () => "now()",
  })
  startedAt: Date;

  @Column("timestamp with time zone", { name: "ended_at", nullable: true })
  endedAt: Date | null;

  @Column("integer", { name: "duration_seconds", nullable: true })
  durationSeconds: number | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.leadListingTimelogs
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadListingProjects;

  @ManyToOne(
    () => LeadListingTasks,
    (leadListingTasks) => leadListingTasks.leadListingTimelogs,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "task_id", referencedColumnName: "id" }])
  task: LeadListingTasks;

  @OneToOne(() => Users, (users) => users.leadListingTimelogs)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
