import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Roles } from "./Roles";
import { Users } from "./Users";

@Index("user_roles_pkey", ["roleId", "userId"], { unique: true })
@Index("idx_user_roles_user_id", ["userId"], {})
@Entity("user_roles", { schema: "public" })
export class UserRoles {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("uuid", { primary: true, name: "role_id" })
  roleId: string;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    nullable: true,
    default: () => "now()",
  })
  assignedAt: Date | null;

  @ManyToOne(() => Roles, (roles) => roles.userRoles, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;

  @ManyToOne(() => Users, (users) => users.userRoles, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
