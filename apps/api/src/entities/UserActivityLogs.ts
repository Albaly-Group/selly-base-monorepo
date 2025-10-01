import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Organizations } from './Organizations';
import { Users } from './Users';

@Index('idx_activity_user_type', ['activityType', 'createdAt', 'userId'], {})
@Index(
  'idx_activity_org_type',
  ['activityType', 'createdAt', 'organizationId'],
  {},
)
@Index('user_activity_logs_pkey', ['id'], { unique: true })
@Entity('user_activity_logs', { schema: 'public' })
export class UserActivityLogs {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'organization_id' })
  organizationId: string;

  @Column('text', { name: 'activity_type' })
  activityType: string;

  @Column('text', { name: 'entity_type', nullable: true })
  entityType: string | null;

  @Column('uuid', { name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column('jsonb', { name: 'details', nullable: true, default: {} })
  details: object | null;

  @Column('jsonb', { name: 'metadata', nullable: true, default: {} })
  metadata: object | null;

  @Column('inet', { name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent: string | null;

  @Column('text', { name: 'session_id', nullable: true })
  sessionId: string | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(
    () => Organizations,
    (organizations) => organizations.userActivityLogs,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;

  @ManyToOne(() => Users, (users) => users.userActivityLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;
}
