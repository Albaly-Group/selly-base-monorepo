import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Clients } from "./Clients";
import { CommonCompanyLists } from "./CommonCompanyLists";

@Index("leads_pkey", ["id"], { unique: true })
@Entity("leads", { schema: "public" })
export class Leads {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("text", {
    name: "contact_status",
    nullable: true,
    default: () => "'new'",
  })
  contactStatus: string | null;

  @Column("text", { name: "notes", nullable: true })
  notes: string | null;

  @Column("text", { name: "tags", nullable: true, array: true })
  tags: string[] | null;

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

  @ManyToOne(() => Users, (users) => users.leads)
  @JoinColumn([{ name: "added_by", referencedColumnName: "id" }])
  addedBy: Users;

  @ManyToOne(() => Clients, (clients) => clients.leads)
  @JoinColumn([{ name: "client_id", referencedColumnName: "id" }])
  client: Clients;

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.leads
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;
}
