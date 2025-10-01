import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

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

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "color", nullable: true })
  color: string | null;

  @Column("text", { name: "icon", nullable: true })
  icon: string | null;

  @Column("text", { name: "category", nullable: true })
  category: string | null;

  @Column("boolean", {
    name: "is_system_tag",
    nullable: true,
    default: () => "false",
  })
  isSystemTag: boolean | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(() => RefTags, (refTags) => refTags.refTags)
  @JoinColumn([{ name: "parent_tag_id", referencedColumnName: "id" }])
  parentTag: RefTags;

  @OneToMany(() => RefTags, (refTags) => refTags.parentTag)
  refTags: RefTags[];
}
