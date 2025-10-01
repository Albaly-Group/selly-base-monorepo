import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { LeadProjects } from "./LeadProjects";

@Index("lead_project_tasks_pkey", ["id"], { unique: true })
@Entity("lead_project_tasks", { schema: "public" })
export class LeadProjectTasks {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "title" })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "task_type", nullable: true })
  taskType: string | null;

  @Column("text", {
    name: "priority",
    nullable: true,
    default: () => "'medium'",
  })
  priority: string | null;

  @Column("text", { name: "status", nullable: true, default: () => "'todo'" })
  status: string | null;

  @Column("timestamp with time zone", { name: "due_date", nullable: true })
  dueDate: Date | null;

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

  @ManyToOne(() => Users, (users) => users.leadProjectTasks, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "assigned_to_user_id", referencedColumnName: "id" }])
  assignedToUser: Users;

  @ManyToOne(
    () => LeadProjects,
    (leadProjects) => leadProjects.leadProjectTasks,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: LeadProjects;
}
