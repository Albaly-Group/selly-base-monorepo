import { Column, Entity, Index, OneToMany } from "typeorm";
import { CommonCompanyRegistrations } from "./CommonCompanyRegistrations";

@Index("ref_registration_authorities_code_key", ["code"], { unique: true })
@Index("ref_registration_authorities_pkey", ["id"], { unique: true })
@Entity("ref_registration_authorities", { schema: "public" })
export class RefRegistrationAuthorities {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "code", unique: true })
  code: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "country_code" })
  countryCode: string;

  @Column("text", { name: "website", nullable: true })
  website: string | null;

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
    () => CommonCompanyRegistrations,
    (commonCompanyRegistrations) => commonCompanyRegistrations.authority
  )
  commonCompanyRegistrations: CommonCompanyRegistrations[];
}
