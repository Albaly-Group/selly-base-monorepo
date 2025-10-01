import { Column, Entity, Index, OneToMany } from "typeorm";
import { RolePermissions } from "./RolePermissions";
import { UserPermissions } from "./UserPermissions";

@Index("permissions_pkey", ["id"], { unique: true })
@Index("permissions_key_key", ["key"], { unique: true })
@Entity("permissions", { schema: "public" })
export class Permissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "key", unique: true })
  key: string;

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

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.permission
  )
  rolePermissions: RolePermissions[];

  @OneToMany(
    () => UserPermissions,
    (userPermissions) => userPermissions.permission
  )
  userPermissions: UserPermissions[];
}
