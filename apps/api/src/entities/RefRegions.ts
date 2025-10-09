import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Index(
  'ref_regions_code_country_code_region_type_key',
  ['code', 'countryCode', 'regionType'],
  { unique: true },
)
@Index('ref_regions_pkey', ['id'], { unique: true })
@Entity('ref_regions', { schema: 'public' })
export class RefRegions {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'code', unique: true })
  code: string;

  @Column('text', { name: 'name_en' })
  nameEn: string;

  @Column('text', { name: 'name_th', nullable: true })
  nameTh: string | null;

  @Column('text', { name: 'region_type', unique: true })
  regionType: string;

  @Column('text', { name: 'country_code', unique: true })
  countryCode: string;

  @Column('boolean', {
    name: 'is_active',
    nullable: true,
    default: () => 'true',
  })
  isActive: boolean | null;

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

  @ManyToOne(() => RefRegions, (refRegions) => refRegions.refRegions)
  @JoinColumn([{ name: 'parent_region_id', referencedColumnName: 'id' }])
  parentRegion: RefRegions;

  @OneToMany(() => RefRegions, (refRegions) => refRegions.parentRegion)
  refRegions: RefRegions[];
}
