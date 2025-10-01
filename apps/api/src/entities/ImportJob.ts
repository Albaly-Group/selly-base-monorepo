import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

@Index("import_jobs_pkey", ["id"], { unique: true })
@Entity("import_jobs", { schema: "public" })
export class ImportJob {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id", nullable: true })
  organizationId: string | null;

  @Column("text", { name: "filename" })
  filename: string;

  @Column("text", {
    name: "status",
    default: () => "'queued'",
  })
  status: string;

  @Column("integer", {
    name: "total_records",
    default: () => "0",
    nullable: true,
  })
  totalRecords: number | null;

  @Column("integer", {
    name: "processed_records",
    default: () => "0",
    nullable: true,
  })
  processedRecords: number | null;

  @Column("integer", {
    name: "valid_records",
    default: () => "0",
    nullable: true,
  })
  validRecords: number | null;

  @Column("integer", {
    name: "error_records",
    default: () => "0",
    nullable: true,
  })
  errorRecords: number | null;

  @Column("uuid", { name: "uploaded_by", nullable: true })
  uploadedBy: string | null;

  @Column("timestamp with time zone", {
    name: "completed_at",
    nullable: true,
  })
  completedAt: Date | null;

  @Column("jsonb", {
    name: "errors",
    default: () => "'[]'",
    nullable: true,
  })
  errors: object | null;

  @Column("jsonb", {
    name: "warnings",
    default: () => "'[]'",
    nullable: true,
  })
  warnings: object | null;

  @Column("jsonb", {
    name: "metadata",
    default: () => "'{}'",
    nullable: true,
  })
  metadata: object | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Organization, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organization;

  @ManyToOne(() => User, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedByUser: User;
}
