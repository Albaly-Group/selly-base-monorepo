import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Index(
  'ref_industry_codes_code_classification_system_key',
  ['classificationSystem', 'code'],
  { unique: true },
)
@Index('ref_industry_codes_pkey', ['id'], { unique: true })
@Entity('ref_industry_codes', { schema: 'public' })
export class RefIndustryCodes {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'code', unique: true })
  code: string;

  @Column('text', { name: 'title_en' })
  titleEn: string | null;

  @Column('text', { name: 'title_th', nullable: true })
  titleTh: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('text', { name: 'classification_system', unique: true })
  classificationSystem: string;

  @Column('integer', { name: 'level' })
  level: number;

  @Column('boolean', {
    name: 'is_active',
    nullable: true,
    default: () => 'true',
  })
  isActive: boolean | null;

  @Column('date', { name: 'effective_date', nullable: true })
  effectiveDate: string | null;

  @Column('date', { name: 'end_date', nullable: true })
  endDate: string | null;

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

  @ManyToOne(
    () => RefIndustryCodes,
    (refIndustryCodes) => refIndustryCodes.refIndustryCodes,
  )
  @JoinColumn([{ name: 'parent_id', referencedColumnName: 'id' }])
  parent: RefIndustryCodes;

  @OneToMany(
    () => RefIndustryCodes,
    (refIndustryCodes) => refIndustryCodes.parent,
  )
  refIndustryCodes: RefIndustryCodes[];
}
