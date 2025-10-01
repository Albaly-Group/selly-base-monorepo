import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Organizations } from './Organizations';
import { Roles } from './Roles';

@Index('user_roles_pkey', ['id'], { unique: true })
@Index(
  'user_roles_user_id_role_id_organization_id_key',
  ['organizationId', 'roleId', 'userId'],
  { unique: true },
)
@Entity('user_roles', { schema: 'public' })
export class UserRoles {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'user_id', unique: true })
  userId: string;

  @Column('uuid', { name: 'role_id', unique: true })
  roleId: string;

  @Column('uuid', { name: 'organization_id', unique: true })
  organizationId: string;

  @Column('timestamp with time zone', {
    name: 'assigned_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date | null;

  @Column('timestamp with time zone', { name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => Users, (users) => users.userRoles, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'assigned_by', referencedColumnName: 'id' }])
  assignedBy: Users;

  @ManyToOne(() => Organizations, (organizations) => organizations.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;

  @ManyToOne(() => Roles, (roles) => roles.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
  role: Roles;

  @ManyToOne(() => Users, (users) => users.userRoles2, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;
}
