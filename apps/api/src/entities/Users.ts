import { Column, Entity, Index, OneToMany, OneToOne } from "typeorm";
import { Clients } from "./Clients";
import { CommonCompanyTags } from "./CommonCompanyTags";
import { LeadListingImports } from "./LeadListingImports";
import { LeadListingProjectCompanies } from "./LeadListingProjectCompanies";
import { LeadListingProjects } from "./LeadListingProjects";
import { LeadListingTasks } from "./LeadListingTasks";
import { LeadListingTimelogs } from "./LeadListingTimelogs";
import { Leads } from "./Leads";
import { UserPermissions } from "./UserPermissions";
import { UserRoles } from "./UserRoles";

@Index("users_email_key", ["email"], { unique: true })
@Index("users_pkey", ["id"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("citext", { name: "email", unique: true })
  email: string;

  @Column("text", { name: "password" })
  password: string;

  @Column("text", { name: "avatar_url", nullable: true })
  avatarUrl: string | null;

  @Column("text", { name: "status", nullable: true, default: () => "'active'" })
  status: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

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

  @OneToMany(() => Clients, (clients) => clients.addedBy)
  clients: Clients[];

  @OneToMany(
    () => CommonCompanyTags,
    (commonCompanyTags) => commonCompanyTags.addedBy
  )
  commonCompanyTags: CommonCompanyTags[];

  @OneToMany(
    () => LeadListingImports,
    (leadListingImports) => leadListingImports.uploadedBy
  )
  leadListingImports: LeadListingImports[];

  @OneToMany(
    () => LeadListingProjectCompanies,
    (leadListingProjectCompanies) => leadListingProjectCompanies.contributor
  )
  leadListingProjectCompanies: LeadListingProjectCompanies[];

  @OneToMany(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.pm
  )
  leadListingProjects: LeadListingProjects[];

  @OneToMany(
    () => LeadListingProjects,
    (leadListingProjects) => leadListingProjects.tl
  )
  leadListingProjects2: LeadListingProjects[];

  @OneToOne(
    () => LeadListingTasks,
    (leadListingTasks) => leadListingTasks.assignedUser
  )
  leadListingTasks: LeadListingTasks;

  @OneToMany(
    () => LeadListingTasks,
    (leadListingTasks) => leadListingTasks.createdBy
  )
  leadListingTasks2: LeadListingTasks[];

  @OneToOne(
    () => LeadListingTimelogs,
    (leadListingTimelogs) => leadListingTimelogs.user
  )
  leadListingTimelogs: LeadListingTimelogs;

  @OneToMany(() => Leads, (leads) => leads.addedBy)
  leads: Leads[];

  @OneToMany(() => UserPermissions, (userPermissions) => userPermissions.user)
  userPermissions: UserPermissions[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles: UserRoles[];
}
