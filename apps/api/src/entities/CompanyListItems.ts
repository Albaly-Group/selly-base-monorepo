import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Companies } from './Companies';
import { CompanyLists } from './CompanyLists';

@Index('company_list_items_list_id_company_id_key', ['companyId', 'listId'], {
  unique: true,
})
@Index('idx_list_items_company', ['companyId'], {})
@Index('company_list_items_pkey', ['id'], { unique: true })
@Index('idx_list_items_score', ['leadScore'], {})
@Index('idx_list_items_list_position', ['listId', 'position'], {})
@Index('idx_list_items_status', ['status'], {})
@Entity('company_list_items', { schema: 'public' })
export class CompanyListItems {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'list_id', unique: true })
  listId: string;

  @Column('uuid', { name: 'company_id', unique: true })
  companyId: string;

  @Column('text', { name: 'note', nullable: true })
  note: string | null;

  @Column('integer', { name: 'position', nullable: true })
  position: number | null;

  @Column('jsonb', { name: 'custom_fields', nullable: true, default: {} })
  customFields: object | null;

  @Column('numeric', {
    name: 'lead_score',
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => '0.0',
  })
  leadScore: string | null;

  @Column('jsonb', { name: 'score_breakdown', nullable: true, default: {} })
  scoreBreakdown: object | null;

  @Column('timestamp with time zone', {
    name: 'score_calculated_at',
    nullable: true,
  })
  scoreCalculatedAt: Date | null;

  @Column('text', { name: 'status', nullable: true, default: () => "'new'" })
  status: string | null;

  @Column('timestamp with time zone', {
    name: 'status_changed_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  statusChangedAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'added_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedAt: Date | null;
  
  @ManyToOne(() => Users, (users) => users.companyListItems, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'added_by_user_id', referencedColumnName: 'id' }])
  addedByUser: Users;

  @ManyToOne(() => Companies, (companies) => companies.companyListItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Companies;

  @ManyToOne(
    () => CompanyLists,
    (companyLists) => companyLists.companyListItems,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn([{ name: 'list_id', referencedColumnName: 'id' }])
  list: CompanyLists;
}
