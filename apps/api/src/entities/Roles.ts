import { Column, Entity, Index, OneToMany } from "typeorm";
import { RolePermissions } from "./RolePermissions";
import { UserRoles } from "./UserRoles";

@Index("roles_pkey", ["id"], { unique: true })
@Index("roles_name_key", ["name"], { unique: true })
@Entity("roles", { schema: "public" })
export class Roles {
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

  @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.role)
  rolePermissions: RolePermissions[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles: UserRoles[];
}
