import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

@Index("export_jobs_pkey", ["id"], { unique: true })
@Entity("export_jobs", { schema: "public" })
export class ExportJob {
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

  @Column("text", { name: "scope", nullable: true })
  scope: string | null;

  @Column("text", {
    name: "format",
    default: () => "'CSV'",
  })
  format: string;

  @Column("integer", {
    name: "total_records",
    default: () => "0",
    nullable: true,
  })
  totalRecords: number | null;

  @Column("text", { name: "file_size", nullable: true })
  fileSize: string | null;

  @Column("text", { name: "download_url", nullable: true })
  downloadUrl: string | null;

  @Column("uuid", { name: "requested_by", nullable: true })
  requestedBy: string | null;

  @Column("timestamp with time zone", {
    name: "completed_at",
    nullable: true,
  })
  completedAt: Date | null;

  @Column("timestamp with time zone", {
    name: "expires_at",
    nullable: true,
  })
  expiresAt: Date | null;

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
  @JoinColumn([{ name: "requested_by", referencedColumnName: "id" }])
  requestedByUser: User;
}
