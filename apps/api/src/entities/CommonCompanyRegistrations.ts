import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { RefRegistrationAuthorities } from "./RefRegistrationAuthorities";
import { CommonCompanyLists } from "./CommonCompanyLists";
import { RefRegistrationTypes } from "./RefRegistrationTypes";

@Index(
  "uq_company_regs_unique_per_authority",
  ["authorityId", "normRegistrationNo"],
  { unique: true }
)
@Index("uq_company_regs_one_primary", ["companyId"], { unique: true })
@Index("common_company_registrations_pkey", ["id"], { unique: true })
@Entity("common_company_registrations", { schema: "public" })
export class CommonCompanyRegistrations {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "company_id" })
  companyId: string;

  @Column("uuid", { name: "authority_id" })
  authorityId: string;

  @Column("text", { name: "registration_no" })
  registrationNo: string;

  @Column("text", { name: "registration_status", nullable: true })
  registrationStatus: string | null;

  @Column("date", { name: "registered_date", nullable: true })
  registeredDate: string | null;

  @Column("date", { name: "deregistered_date", nullable: true })
  deregisteredDate: string | null;

  @Column("text", { name: "country_code", nullable: true })
  countryCode: string | null;

  @Column("text", { name: "remarks", nullable: true })
  remarks: string | null;

  @Column("boolean", { name: "is_primary", default: () => "false" })
  isPrimary: boolean;

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

  @Column("text", { name: "norm_registration_no", nullable: true })
  normRegistrationNo: string | null;

  @ManyToOne(
    () => RefRegistrationAuthorities,
    (refRegistrationAuthorities) =>
      refRegistrationAuthorities.commonCompanyRegistrations,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "authority_id", referencedColumnName: "id" }])
  authority: RefRegistrationAuthorities;

  @OneToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.commonCompanyRegistrations,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;

  @ManyToOne(
    () => RefRegistrationTypes,
    (refRegistrationTypes) => refRegistrationTypes.commonCompanyRegistrations,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "registration_type_id", referencedColumnName: "id" }])
  registrationType: RefRegistrationTypes;
}
