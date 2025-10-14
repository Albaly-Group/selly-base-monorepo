import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Companies } from './Companies';
import { RefTags } from './RefTags';
import { Users } from './Users';

@Index('company_tags_pkey', ['id'], { unique: true })
@Index('idx_company_tags_company', ['companyId'], {})
@Index('idx_company_tags_tag', ['tagId'], {})
@Index('company_tags_company_id_tag_id_key', ['companyId', 'tagId'], {
  unique: true,
})
@Entity('company_tags', { schema: 'public' })
export class CompanyTags {
  @PrimaryGeneratedColumn('uuid')
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'tag_id' })
  tagId: string;

  @Column('uuid', { name: 'added_by', nullable: true })
  addedBy: string | null;

  @Column('timestamp with time zone', {
    name: 'added_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedAt: Date | null;

  @ManyToOne(() => Companies, (companies) => companies.companyTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Companies;

  @ManyToOne(() => RefTags, (refTags) => refTags.companyTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'tag_id', referencedColumnName: 'id' }])
  tag: RefTags;

  @ManyToOne(() => Users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'added_by', referencedColumnName: 'id' }])
  addedByUser: Users;
}
