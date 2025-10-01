import { Column, Entity, Index, OneToMany } from 'typeorm';
import { UserRoles } from './UserRoles';

@Index('roles_pkey', ['id'], { unique: true })
@Index('roles_name_key', ['name'], { unique: true })
@Entity('roles', { schema: 'public' })
export class Roles {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'name', unique: true })
  name: string;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('boolean', {
    name: 'is_system_role',
    nullable: true,
    default: () => 'false',
  })
  isSystemRole: boolean | null;

  @Column('text', {
    name: 'permissions',
    nullable: true,
    array: true,
    default: () => "'{}'[]",
  })
  permissions: string[] | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles: UserRoles[];
}
