import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AuditLogs } from './AuditLogs';
import { Companies } from './Companies';
import { CompanyLists } from './CompanyLists';
import { ExportJobs } from './ExportJobs';
import { ImportJobs } from './ImportJobs';
import { LeadProjects } from './LeadProjects';
import { UserActivityLogs } from './UserActivityLogs';
import { UserRoles } from './UserRoles';
import { Users } from './Users';

@Index('organizations_pkey', ['id'], { unique: true })
@Index('organizations_slug_key', ['slug'], { unique: true })
@Entity('organizations', { schema: 'public' })
export class Organizations {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'name' })
  name: string;

  @Column('text', { name: 'slug', unique: true })
  slug: string;

  @Column('text', { name: 'domain', nullable: true })
  domain: string | null;

  @Column('text', { name: 'status', default: () => "'active'" })
  status: string;

  @Column('text', {
    name: 'subscription_tier',
    nullable: true,
    default: () => "'basic'",
  })
  subscriptionTier: string | null;

  @Column('jsonb', { name: 'settings', nullable: true, default: {} })
  settings: object | null;

  @Column('jsonb', { name: 'metadata', nullable: true, default: {} })
  metadata: object | null;

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

  @OneToMany(() => AuditLogs, (auditLogs) => auditLogs.organization)
  auditLogs: AuditLogs[];

  @OneToMany(() => Companies, (companies) => companies.organization)
  companies: Companies[];

  @OneToMany(() => CompanyLists, (companyLists) => companyLists.organization)
  companyLists: CompanyLists[];

  @OneToMany(() => ExportJobs, (exportJobs) => exportJobs.organization)
  exportJobs: ExportJobs[];

  @OneToMany(() => ImportJobs, (importJobs) => importJobs.organization)
  importJobs: ImportJobs[];

  @OneToMany(() => LeadProjects, (leadProjects) => leadProjects.organization)
  leadProjects: LeadProjects[];

  @OneToMany(
    () => UserActivityLogs,
    (userActivityLogs) => userActivityLogs.organization,
  )
  userActivityLogs: UserActivityLogs[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.organization)
  userRoles: UserRoles[];

  @OneToMany(() => Users, (users) => users.organization)
  users: Users[];
}
