import { Column, Entity, Index, OneToMany } from "typeorm";
import { CommonCompanyClassifications } from "./CommonCompanyClassifications";

@Index("ref_tsic_2009_pkey", ["activityCode"], { unique: true })
@Entity("ref_tsic_2009", { schema: "public" })
export class RefTsic_2009 {
  @Column("text", { primary: true, name: "activity_code" })
  activityCode: string;

  @Column("text", { name: "title_th" })
  titleTh: string;

  @Column("text", { name: "title_en", nullable: true })
  titleEn: string | null;

  @Column("character", { name: "section", nullable: true, length: 1 })
  section: string | null;

  @Column("text", { name: "division", nullable: true })
  division: string | null;

  @Column("text", { name: "group_code", nullable: true })
  groupCode: string | null;

  @Column("text", { name: "class_code", nullable: true })
  classCode: string | null;

  @Column("jsonb", { name: "notes", nullable: true })
  notes: object | null;

  @OneToMany(
    () => CommonCompanyClassifications,
    (commonCompanyClassifications) => commonCompanyClassifications.tsicCode2
  )
  commonCompanyClassifications: CommonCompanyClassifications[];
}
