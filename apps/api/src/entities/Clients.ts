import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Users } from "./Users";
import { CommonCompanyLists } from "./CommonCompanyLists";
import { Leads } from "./Leads";

@Index("clients_pkey", ["id"], { unique: true })
@Entity("clients", { schema: "public" })
export class Clients {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", { name: "industry_focus", nullable: true, array: true })
  industryFocus: string[] | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("text", { name: "onboarding_status", nullable: true })
  onboardingStatus: string | null;

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

  @ManyToOne(() => Users, (users) => users.clients)
  @JoinColumn([{ name: "added_by", referencedColumnName: "id" }])
  addedBy: Users;

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.clients
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;

  @OneToMany(() => Leads, (leads) => leads.client)
  leads: Leads[];
}
