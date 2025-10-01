import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { CommonCompanyTags } from "./CommonCompanyTags";
import { RefTagCategories } from "./RefTagCategories";

@Index("ref_tags_pkey", ["id"], { unique: true })
@Index("ref_tags_key_key", ["key"], { unique: true })
@Entity("ref_tags", { schema: "public" })
export class RefTags {
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

  @Column("smallint", { name: "depth", nullable: true, default: () => "0" })
  depth: number | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @OneToMany(
    () => CommonCompanyTags,
    (commonCompanyTags) => commonCompanyTags.tag
  )
  commonCompanyTags: CommonCompanyTags[];

  @ManyToOne(
    () => RefTagCategories,
    (refTagCategories) => refTagCategories.refTags,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "id" }])
  category: RefTagCategories;

  @ManyToOne(() => RefTags, (refTags) => refTags.refTags, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: RefTags;

  @OneToMany(() => RefTags, (refTags) => refTags.parent)
  refTags: RefTags[];
}
