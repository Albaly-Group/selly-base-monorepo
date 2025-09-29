import { IsString, IsOptional, IsIn, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyListDto {
  @ApiProperty({
    description: 'Name of the company list',
    example: 'Technology Prospects Q1 2024'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the company list (optional)',
    example: 'List of potential technology clients for Q1 2024 outreach',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Visibility level of the list',
    example: 'private',
    enum: ['private', 'team', 'organization', 'public'],
    required: false
  })
  @IsOptional()
  @IsIn(['private', 'team', 'organization', 'public'])
  visibility?: 'private' | 'team' | 'organization' | 'public';

  @ApiProperty({
    description: 'Whether this is a smart list with auto-updating criteria',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isSmartList?: boolean;

  @ApiProperty({
    description: 'Smart list criteria (for smart lists only)',
    example: { industry: 'technology', size: 'medium', location: 'Bangkok' },
    required: false
  })
  @IsOptional()
  smartCriteria?: Record<string, any>;
}

export class UpdateCompanyListDto {
  @ApiProperty({
    description: 'Name of the company list (optional)',
    example: 'Technology Prospects Q1 2024',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the company list (optional)',
    example: 'List of potential technology clients for Q1 2024 outreach',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Visibility level of the list (optional)',
    example: 'private',
    enum: ['private', 'team', 'organization', 'public'],
    required: false
  })
  @IsOptional()
  @IsIn(['private', 'team', 'organization', 'public'])
  visibility?: 'private' | 'team' | 'organization' | 'public';

  @ApiProperty({
    description: 'Whether this is a smart list with auto-updating criteria (optional)',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isSmartList?: boolean;

  @ApiProperty({
    description: 'Smart list criteria (for smart lists only, optional)',
    example: { industry: 'technology', size: 'medium', location: 'Bangkok' },
    required: false
  })
  @IsOptional()
  smartCriteria?: Record<string, any>;
}

export class AddCompaniesToListDto {
  @ApiProperty({
    description: 'Array of company IDs to add to the list',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  companyIds: string[];
}

export class RemoveCompaniesFromListDto {
  @ApiProperty({
    description: 'Array of company IDs to remove from the list',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  companyIds: string[];
}