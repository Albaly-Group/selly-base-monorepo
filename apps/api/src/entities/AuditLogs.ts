import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Organizations } from "./Organizations";
import { Users } from "./Users";

@Index("idx_audit_logs_action", ["actionType", "createdAt"], {})
@Index("idx_audit_logs_entity", ["createdAt", "entityId", "entityType"], {})
@Index("idx_audit_logs_user_time", ["createdAt", "userId"], {})
@Index("idx_audit_logs_org_time", ["createdAt", "organizationId"], {})
@Index("audit_logs_pkey", ["id"], { unique: true })
@Entity("audit_logs", { schema: "public" })
export class AuditLogs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "organization_id" })
  organizationId: string;

  @Column("uuid", { name: "user_id", nullable: true })
  userId: string | null;

  @Column("text", { name: "entity_type" })
  entityType: string;

  @Column("uuid", { name: "entity_id", nullable: true })
  entityId: string | null;

  @Column("text", { name: "action_type" })
  actionType: string;

  @Column("text", { name: "resource_type", nullable: true })
  resourceType: string | null;

  @Column("text", { name: "resource_path", nullable: true })
  resourcePath: string | null;

  @Column("jsonb", { name: "old_values", nullable: true })
  oldValues: object | null;

  @Column("jsonb", { name: "new_values", nullable: true })
  newValues: object | null;

  @Column("jsonb", { name: "changes", nullable: true })
  changes: object | null;

  @Column("inet", { name: "ip_address", nullable: true })
  ipAddress: string | null;

  @Column("text", { name: "user_agent", nullable: true })
  userAgent: string | null;

  @Column("text", { name: "session_id", nullable: true })
  sessionId: string | null;

  @Column("text", { name: "request_id", nullable: true })
  requestId: string | null;

  @Column("integer", { name: "status_code", nullable: true })
  statusCode: number | null;

  @Column("text", { name: "error_message", nullable: true })
  errorMessage: string | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => Organizations, (organizations) => organizations.auditLogs, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.auditLogs, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
