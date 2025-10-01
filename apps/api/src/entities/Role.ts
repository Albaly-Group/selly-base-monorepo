import { Column, Entity, Index, OneToMany } from "typeorm";
import { UserRole } from "./UserRole";

@Index("roles_pkey", ["id"], { unique: true })
@Index("roles_name_key", ["name"], { unique: true })
@Entity("roles", { schema: "public" })
export class Role {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "name", unique: true })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("boolean", {
    name: "is_system_role",
    default: () => "false",
    nullable: true,
  })
  isSystemRole: boolean | null;

  @Column("text", {
    name: "permissions",
    array: true,
    default: () => "'{}'",
    nullable: true,
  })
  permissions: string[] | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
