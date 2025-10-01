import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { CommonCompanyLists } from "./CommonCompanyLists";
import { RefTags } from "./RefTags";

@Index("common_company_tags_pkey", ["companyId", "tagId"], { unique: true })
@Entity("common_company_tags", { schema: "public" })
export class CommonCompanyTags {
  @Column("uuid", { primary: true, name: "company_id" })
  companyId: string;

  @Column("uuid", { primary: true, name: "tag_id" })
  tagId: string;

  @Column("timestamp with time zone", {
    name: "added_at",
    nullable: true,
    default: () => "now()",
  })
  addedAt: Date | null;

  @ManyToOne(() => Users, (users) => users.commonCompanyTags)
  @JoinColumn([{ name: "added_by", referencedColumnName: "id" }])
  addedBy: Users;

  @ManyToOne(
    () => CommonCompanyLists,
    (commonCompanyLists) => commonCompanyLists.commonCompanyTags,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "company_id", referencedColumnName: "id" }])
  company: CommonCompanyLists;

  @ManyToOne(() => RefTags, (refTags) => refTags.commonCompanyTags, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "tag_id", referencedColumnName: "id" }])
  tag: RefTags;
}
