import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { CompanyList } from "./CompanyList";
import { Company } from "./Company";
import { User } from "./User";

@Index("company_list_items_pkey", ["id"], { unique: true })
@Index("company_list_items_list_id_company_id_key", ["listId", "companyId"], { unique: true })
@Entity("company_list_items", { schema: "public" })
export class CompanyListItem {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "list_id" })
  listId: string;

  @Column("uuid", { name: "company_id" })
  companyId: string;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

  @Column("integer", { name: "position", nullable: true })
  position: number | null;

  @Column("jsonb", {
    name: "custom_fields",
    default: () => "'{}'",
    nullable: true,
  })
  customFields: object | null;

  @Column("decimal", {
    name: "lead_score",
    precision: 5,
    scale: 2,
    default: () => "0.0",
    nullable: true,
  })
  leadScore: string | null;

  @Column("jsonb", {
    name: "score_breakdown",
    default: () => "'{}'",
    nullable: true,
  })
  scoreBreakdown: object | null;

  @Column("timestamp with time zone", {
    name: "score_calculated_at",
    nullable: true,
  })
  scoreCalculatedAt: Date | null;

  @Column("text", {
    name: "status",
    default: () => "'new'",
    nullable: true,
  })
  status: string | null;

  @Column("timestamp with time zone", {
    name: "status_changed_at",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  statusChangedAt: Date | null;

  @Column("uuid", { name: "added_by_user_id", nullable: true })
  addedByUserId: string | null;

  @Column("timestamp with time zone", {
    name: "added_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  addedAt: Date;

  @ManyToOne(() => CompanyList, (list) => list.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "list_id", referencedColumnName: "id" }])
  list: CompanyList;

  @ManyToOne(() => Company, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: Company;

  @ManyToOne(() => User, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "added_by_user_id", referencedColumnName: "id" }])
  addedByUser: User;
}
