import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Permissions } from "./Permissions";
import { Users } from "./Users";

@Index("user_permissions_pkey", ["permissionId", "userId"], { unique: true })
@Index("idx_user_permissions_user_id", ["userId"], {})
@Entity("user_permissions", { schema: "public" })
export class UserPermissions {
  @Column("uuid", { primary: true, name: "user_id" })
  userId: string;

  @Column("uuid", { primary: true, name: "permission_id" })
  permissionId: string;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    nullable: true,
    default: () => "now()",
  })
  assignedAt: Date | null;

  @ManyToOne(() => Permissions, (permissions) => permissions.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Users, (users) => users.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
