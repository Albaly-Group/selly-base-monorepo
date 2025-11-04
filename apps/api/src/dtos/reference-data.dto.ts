import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO for creating/updating industry codes
export class CreateIndustryCodeDto {
  @ApiProperty({
    description: 'Industry code',
    example: 'MFG-001',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Title in English',
    example: 'Manufacturing',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  titleEn: string;

  @ApiProperty({
    description: 'Title in Thai (optional)',
    example: 'การผลิต',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleTh?: string;

  @ApiProperty({
    description: 'Description (optional)',
    example: 'Manufacturing and production industries',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Classification system',
    example: 'ISIC',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  classificationSystem: string;

  @ApiProperty({
    description: 'Hierarchy level',
    example: 1,
  })
  @IsInt()
  level: number;

  @ApiProperty({
    description:
      'Parent industry code ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Effective date (optional)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateIndustryCodeDto {
  @ApiProperty({
    description: 'Industry code',
    example: 'MFG-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @ApiProperty({
    description: 'Title in English',
    example: 'Manufacturing',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  titleEn?: string;

  @ApiProperty({
    description: 'Title in Thai (optional)',
    example: 'การผลิต',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleTh?: string;

  @ApiProperty({
    description: 'Description (optional)',
    example: 'Manufacturing and production industries',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Classification system',
    example: 'ISIC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  classificationSystem?: string;

  @ApiProperty({
    description: 'Hierarchy level',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  level?: number;

  @ApiProperty({
    description:
      'Parent industry code ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Effective date (optional)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// DTO for creating/updating regions
export class CreateRegionDto {
  @ApiProperty({
    description: 'Region code',
    example: 'BKK',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Name in English',
    example: 'Bangkok',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn: string;

  @ApiProperty({
    description: 'Name in Thai (optional)',
    example: 'กรุงเทพมหานคร',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameTh?: string;

  @ApiProperty({
    description: 'Region type',
    example: 'province',
    enum: ['country', 'province', 'district', 'subdistrict'],
  })
  @IsEnum(['country', 'province', 'district', 'subdistrict'])
  regionType: string;

  @ApiProperty({
    description: 'Country code',
    example: 'TH',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode: string;

  @ApiProperty({
    description: 'Parent region ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentRegionId?: string;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRegionDto {
  @ApiProperty({
    description: 'Region code',
    example: 'BKK',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @ApiProperty({
    description: 'Name in English',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn?: string;

  @ApiProperty({
    description: 'Name in Thai (optional)',
    example: 'กรุงเทพมหานคร',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameTh?: string;

  @ApiProperty({
    description: 'Region type',
    example: 'province',
    enum: ['country', 'province', 'district', 'subdistrict'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['country', 'province', 'district', 'subdistrict'])
  regionType?: string;

  @ApiProperty({
    description: 'Country code',
    example: 'TH',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode?: string;

  @ApiProperty({
    description: 'Parent region ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentRegionId?: string;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO for creating/updating tags
export class CreateTagDto {
  @ApiProperty({
    description: 'Unique tag key',
    example: 'export-ready',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'Export Ready',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Tag description (optional)',
    example: 'Companies ready for export markets',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Tag color (optional)',
    example: '#3b82f6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({
    description: 'Tag icon (optional)',
    example: 'globe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Tag category (optional)',
    example: 'business',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    description: 'Parent tag ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentTagId?: string;

  @ApiProperty({
    description: 'Is system tag',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystemTag?: boolean;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTagDto {
  @ApiProperty({
    description: 'Unique tag key',
    example: 'export-ready',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key?: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'Export Ready',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Tag description (optional)',
    example: 'Companies ready for export markets',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Tag color (optional)',
    example: '#3b82f6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({
    description: 'Tag icon (optional)',
    example: 'globe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Tag category (optional)',
    example: 'business',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    description: 'Parent tag ID (optional, for hierarchical structure)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentTagId?: string;

  @ApiProperty({
    description: 'Is system tag',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystemTag?: boolean;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
