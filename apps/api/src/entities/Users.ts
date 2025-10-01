import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AuditLogs } from './AuditLogs';
import { CompanyListItems } from './CompanyListItems';
import { CompanyLists } from './CompanyLists';
import { ExportJobs } from './ExportJobs';
import { ImportJobs } from './ImportJobs';
import { LeadProjectCompanies } from './LeadProjectCompanies';
import { LeadProjectTasks } from './LeadProjectTasks';
import { LeadProjects } from './LeadProjects';
import { UserActivityLogs } from './UserActivityLogs';
import { UserRoles } from './UserRoles';
import { Organizations } from './Organizations';

@Index('idx_users_organization_email', ['email', 'organizationId'], {})
@Index('users_email_key', ['email'], { unique: true })
@Index('users_pkey', ['id'], { unique: true })
@Index('idx_users_last_login', ['lastLoginAt'], {})
@Index('idx_users_organization_status', ['organizationId', 'status'], {})
@Entity('users', { schema: 'public' })
export class Users {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'organization_id', nullable: true })
  organizationId: string | null;

  @Column('citext', { name: 'email', unique: true })
  email: string;

  @Column('text', { name: 'name' })
  name: string;

  @Column('text', { name: 'password_hash' })
  passwordHash: string;

  @Column('text', { name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column('text', { name: 'status', default: () => "'active'" })
  status: string;

  @Column('timestamp with time zone', { name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'email_verified_at',
    nullable: true,
  })
  emailVerifiedAt: Date | null;

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

  @OneToMany(() => AuditLogs, (auditLogs) => auditLogs.user)
  auditLogs: AuditLogs[];

  @OneToMany(
    () => CompanyListItems,
    (companyListItems) => companyListItems.addedByUser,
  )
  companyListItems: CompanyListItems[];

  @OneToMany(() => CompanyLists, (companyLists) => companyLists.ownerUser)
  companyLists: CompanyLists[];

  @OneToMany(() => ExportJobs, (exportJobs) => exportJobs.requestedBy2)
  exportJobs: ExportJobs[];

  @OneToMany(() => ImportJobs, (importJobs) => importJobs.uploadedBy2)
  importJobs: ImportJobs[];

  @OneToMany(
    () => LeadProjectCompanies,
    (leadProjectCompanies) => leadProjectCompanies.addedByUser,
  )
  leadProjectCompanies: LeadProjectCompanies[];

  @OneToMany(
    () => LeadProjectCompanies,
    (leadProjectCompanies) => leadProjectCompanies.assignedToUser,
  )
  leadProjectCompanies2: LeadProjectCompanies[];

  @OneToMany(
    () => LeadProjectTasks,
    (leadProjectTasks) => leadProjectTasks.assignedToUser,
  )
  leadProjectTasks: LeadProjectTasks[];

  @OneToMany(() => LeadProjects, (leadProjects) => leadProjects.ownerUser)
  leadProjects: LeadProjects[];

  @OneToMany(() => LeadProjects, (leadProjects) => leadProjects.pmUser)
  leadProjects2: LeadProjects[];

  @OneToMany(() => LeadProjects, (leadProjects) => leadProjects.teamLeadUser)
  leadProjects3: LeadProjects[];

  @OneToMany(
    () => UserActivityLogs,
    (userActivityLogs) => userActivityLogs.user,
  )
  userActivityLogs: UserActivityLogs[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.assignedBy)
  userRoles: UserRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles2: UserRoles[];

  @ManyToOne(() => Organizations, (organizations) => organizations.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'organization_id', referencedColumnName: 'id' }])
  organization: Organizations;
}
