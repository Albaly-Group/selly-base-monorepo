import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateCompanyRegistrationDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Registration number',
    example: '0105563001234',
  })
  @IsString()
  registrationNo: string;

  @ApiProperty({
    description: 'Registration type',
    example: 'LIMITED',
  })
  @IsString()
  registrationType: string;

  @ApiProperty({
    description: 'Authority code',
    example: 'DBD',
  })
  @IsString()
  authorityCode: string;

  @ApiProperty({
    description: 'Country code',
    example: 'TH',
    default: 'TH',
  })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({
    description: 'Registration status',
    example: 'active',
    enum: ['active', 'inactive', 'dissolved', 'suspended'],
    default: 'active',
  })
  @IsIn(['active', 'inactive', 'dissolved', 'suspended'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Registered date',
    example: '2020-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  registeredDate?: string;

  @ApiProperty({
    description: 'Dissolved date',
    example: '2025-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dissolvedDate?: string;

  @ApiProperty({
    description: 'Is this the primary registration',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Additional remarks',
    example: 'Main registration for Thai operations',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateCompanyRegistrationDto {
  @ApiProperty({
    description: 'Registration number',
    example: '0105563001234',
    required: false,
  })
  @IsString()
  @IsOptional()
  registrationNo?: string;

  @ApiProperty({
    description: 'Registration type',
    example: 'LIMITED',
    required: false,
  })
  @IsString()
  @IsOptional()
  registrationType?: string;

  @ApiProperty({
    description: 'Authority code',
    example: 'DBD',
    required: false,
  })
  @IsString()
  @IsOptional()
  authorityCode?: string;

  @ApiProperty({
    description: 'Country code',
    example: 'TH',
    required: false,
  })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiProperty({
    description: 'Registration status',
    example: 'active',
    enum: ['active', 'inactive', 'dissolved', 'suspended'],
    required: false,
  })
  @IsIn(['active', 'inactive', 'dissolved', 'suspended'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Registered date',
    example: '2020-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  registeredDate?: string;

  @ApiProperty({
    description: 'Dissolved date',
    example: '2025-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dissolvedDate?: string;

  @ApiProperty({
    description: 'Is this the primary registration',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Additional remarks',
    example: 'Updated registration info',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}
