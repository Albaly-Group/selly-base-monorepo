import { Column, Entity, Index, OneToMany } from "typeorm";
import { User } from "./User";

@Index("organizations_pkey", ["id"], { unique: true })
@Index("organizations_slug_key", ["slug"], { unique: true })
@Entity("organizations", { schema: "public" })
export class Organization {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "slug", unique: true })
  slug: string;

  @Column("text", { name: "domain", nullable: true })
  domain: string | null;

  @Column("text", {
    name: "status",
    default: () => "'active'",
  })
  status: string;

  @Column("text", {
    name: "subscription_tier",
    default: () => "'basic'",
    nullable: true,
  })
  subscriptionTier: string | null;

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

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
