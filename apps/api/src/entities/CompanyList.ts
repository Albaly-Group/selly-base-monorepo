import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";
import { CompanyListItem } from "./CompanyListItem";

@Index("company_lists_pkey", ["id"], { unique: true })
@Entity("company_lists", { schema: "public" })
export class CompanyList {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id" })
  organizationId: string;

  @Column("uuid", { name: "owner_user_id" })
  ownerUserId: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", {
    name: "visibility",
    default: () => "'private'",
    nullable: true,
  })
  visibility: string | null;

  @Column("boolean", {
    name: "is_shared",
    default: () => "false",
    nullable: true,
  })
  isShared: boolean | null;

  @Column("integer", {
    name: "total_companies",
    default: () => "0",
    nullable: true,
  })
  totalCompanies: number | null;

  @Column("timestamp with time zone", {
    name: "last_activity_at",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  lastActivityAt: Date | null;

  @Column("boolean", {
    name: "is_smart_list",
    default: () => "false",
    nullable: true,
  })
  isSmartList: boolean | null;

  @Column("jsonb", {
    name: "smart_criteria",
    default: () => "'{}'",
    nullable: true,
  })
  smartCriteria: object | null;

  @Column("timestamp with time zone", {
    name: "last_refreshed_at",
    nullable: true,
  })
  lastRefreshedAt: Date | null;

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

  @ManyToOne(() => Organization, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organization;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "owner_user_id", referencedColumnName: "id" }])
  ownerUser: User;

  @OneToMany(() => CompanyListItem, (item) => item.list)
  items: CompanyListItem[];
}
