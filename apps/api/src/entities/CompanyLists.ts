import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CompanyListItems } from "./CompanyListItems";
import { Organizations } from "./Organizations";
import { Users } from "./Users";
import { LeadProjectCompanies } from "./LeadProjectCompanies";

@Index("company_lists_pkey", ["id"], { unique: true })
@Index("idx_company_lists_smart", ["isSmartList"], {})
@Index("idx_company_lists_activity", ["lastActivityAt"], {})
@Index("idx_company_lists_org_owner", ["organizationId", "ownerUserId"], {})
@Index("idx_company_lists_visibility", ["visibility"], {})
@Entity("company_lists", { schema: "public" })
export class CompanyLists {
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
    nullable: true,
    default: () => "'private'",
  })
  visibility: string | null;

  @Column("boolean", {
    name: "is_shared",
    nullable: true,
    default: () => "false",
  })
  isShared: boolean | null;

  @Column("integer", {
    name: "total_companies",
    nullable: true,
    default: () => "0",
  })
  totalCompanies: number | null;

  @Column("timestamp with time zone", {
    name: "last_activity_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  lastActivityAt: Date | null;

  @Column("boolean", {
    name: "is_smart_list",
    nullable: true,
    default: () => "false",
  })
  isSmartList: boolean | null;

  @Column("jsonb", { name: "smart_criteria", nullable: true, default: {} })
  smartCriteria: object | null;

  @Column("timestamp with time zone", {
    name: "last_refreshed_at",
    nullable: true,
  })
  lastRefreshedAt: Date | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @OneToMany(
    () => CompanyListItems,
    (companyListItems) => companyListItems.list
  )
  companyListItems: CompanyListItems[];

  @ManyToOne(
    () => Organizations,
    (organizations) => organizations.companyLists,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.companyLists, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "owner_user_id", referencedColumnName: "id" }])
  ownerUser: Users;

  @OneToMany(
    () => LeadProjectCompanies,
    (leadProjectCompanies) => leadProjectCompanies.sourceList
  )
  leadProjectCompanies: LeadProjectCompanies[];
}
