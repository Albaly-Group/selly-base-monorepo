import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Organization } from "./Organization";
import { UserRole } from "./UserRole";
import { CompanyList } from "./CompanyList";

@Index("users_pkey", ["id"], { unique: true })
@Index("users_email_key", ["email"], { unique: true })
@Entity("users", { schema: "public" })
export class User {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id" })
  organizationId: string;

  @Column("citext", { name: "email", unique: true })
  email: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "password_hash" })
  passwordHash: string;

  @Column("text", { name: "avatar_url", nullable: true })
  avatarUrl: string | null;

  @Column("text", {
    name: "status",
    default: () => "'active'",
  })
  status: string;

  @Column("timestamp with time zone", {
    name: "last_login_at",
    nullable: true,
  })
  lastLoginAt: Date | null;

  @Column("timestamp with time zone", {
    name: "email_verified_at",
    nullable: true,
  })
  emailVerifiedAt: Date | null;

  @Column("jsonb", {
    name: "settings",
    default: () => "'{}'",
    nullable: true,
  })
  settings: object | null;

  @Column("jsonb", {
    name: "metadata",
    default: () => "'{}'",
    nullable: true,
  })
  metadata: object | null;

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

  @ManyToOne(() => Organization, (organization) => organization.users, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organization;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @OneToMany(() => CompanyList, (companyList) => companyList.ownerUser)
  ownedLists: CompanyList[];
}
