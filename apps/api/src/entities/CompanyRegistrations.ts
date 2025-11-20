import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Companies } from './Companies';

@Index(
  'company_registrations_registration_no_authority_id_key',
  ['authorityId', 'registrationNo'],
  { unique: true },
)
@Index('company_registrations_pkey', ['id'], { unique: true })
@Entity('company_registrations', { schema: 'public' })
export class CompanyRegistrations {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;
  @Column('text', { name: 'registration_no' })
  registrationNo: string;

  @Column('uuid', { name: 'authority_id' })
  authorityId: string;

  @Column('uuid', { name: 'registration_type_id' })
  registrationTypeId: string;

  @Column('text', { name: 'country_code' })
  countryCode: string;

  @Column('text', { name: 'status', nullable: true, default: () => "'active'" })
  status: string | null;

  @Column('date', { name: 'registered_date', nullable: true })
  registeredDate: string | null;

  @Column('date', { name: 'dissolved_date', nullable: true })
  dissolvedDate: string | null;

  @Column('boolean', {
    name: 'is_primary',
    nullable: true,
    default: () => 'false',
  })
  isPrimary: boolean | null;

  @Column('jsonb', { name: 'raw_data', nullable: true, default: {} })
  rawData: object | null;

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

  @ManyToOne(() => Companies, (companies) => companies.companyRegistrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company: Companies;
}
