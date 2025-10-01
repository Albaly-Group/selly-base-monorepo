import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Permissions } from "./Permissions";
import { Roles } from "./Roles";

@Index("role_permissions_pkey", ["permissionId", "roleId"], { unique: true })
@Index("idx_role_permissions_role_id", ["roleId"], {})
@Entity("role_permissions", { schema: "public" })
export class RolePermissions {
  @Column("uuid", { primary: true, name: "role_id" })
  roleId: string;

  @Column("uuid", { primary: true, name: "permission_id" })
  permissionId: string;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    nullable: true,
    default: () => "now()",
  })
  assignedAt: Date | null;

  @ManyToOne(() => Permissions, (permissions) => permissions.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Roles, (roles) => roles.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;
}
