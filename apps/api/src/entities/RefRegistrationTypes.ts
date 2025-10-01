import { Column, Entity, Index, OneToMany } from "typeorm";
import { CommonCompanyRegistrations } from "./CommonCompanyRegistrations";

@Index("ref_registration_types_pkey", ["id"], { unique: true })
@Index("ref_registration_types_key_key", ["key"], { unique: true })
@Entity("ref_registration_types", { schema: "public" })
export class RefRegistrationTypes {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "key", unique: true })
  key: string;

  @Column("text", { name: "name" })
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

  @OneToMany(
    () => CommonCompanyRegistrations,
    (commonCompanyRegistrations) => commonCompanyRegistrations.registrationType
  )
  commonCompanyRegistrations: CommonCompanyRegistrations[];
}
