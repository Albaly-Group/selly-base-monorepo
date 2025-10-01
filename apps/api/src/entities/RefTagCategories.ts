import { Column, Entity, Index, OneToMany } from "typeorm";
import { RefTags } from "./RefTags";

@Index("ref_tag_categories_pkey", ["id"], { unique: true })
@Index("ref_tag_categories_key_key", ["key"], { unique: true })
@Entity("ref_tag_categories", { schema: "public" })
export class RefTagCategories {
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

  @OneToMany(() => RefTags, (refTags) => refTags.category)
  refTags: RefTags[];
}
