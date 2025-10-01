import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Role } from "./Role";
import { Organization } from "./Organization";

@Index("user_roles_pkey", ["id"], { unique: true })
@Index("user_roles_user_id_role_id_organization_id_key", ["userId", "roleId", "organizationId"], { unique: true })
@Entity("user_roles", { schema: "public" })
export class UserRole {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("uuid", { name: "role_id" })
  roleId: string;

  @Column("uuid", { name: "organization_id" })
  organizationId: string;

  @Column("uuid", { name: "assigned_by", nullable: true })
  assignedBy: string | null;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt: Date;

  @Column("timestamp with time zone", {
    name: "expires_at",
    nullable: true,
  })
  expiresAt: Date | null;

  @ManyToOne(() => User, (user) => user.roles, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => Organization, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organization;
}
