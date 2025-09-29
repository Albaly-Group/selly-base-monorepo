import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@albaly.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name in English',
    example: 'Albaly Digital Co., Ltd.',
  })
  @IsString()
  companyNameEn: string;

  @ApiProperty({
    description: 'Company name in Thai (optional)',
    example: 'บริษัท อัลบาลี ดิจิทัล จำกัด',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyNameTh?: string;

  @ApiProperty({
    description: 'Business description (optional)',
    example: 'Digital transformation and software development company',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiProperty({
    description: 'Company website URL (optional)',
    example: 'https://albaly.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({
    description: 'Primary email address (optional)',
    example: 'info@albaly.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @ApiProperty({
    description: 'Primary phone number (optional)',
    example: '+66-2-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @ApiProperty({
    description: 'Address line 1 (optional)',
    example: '123 Sukhumvit Road',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({
    description: 'Province (optional)',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({
    description: 'Country code (optional)',
    example: 'TH',
    required: false,
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({
    description: 'Company tags (optional)',
    example: ['technology', 'software', 'digital'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Company name in English (optional)',
    example: 'Albaly Digital Co., Ltd.',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyNameEn?: string;

  @ApiProperty({
    description: 'Company name in Thai (optional)',
    example: 'บริษัท อัลบาลี ดิจิทัล จำกัด',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyNameTh?: string;

  @ApiProperty({
    description: 'Business description (optional)',
    example: 'Digital transformation and software development company',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiProperty({
    description: 'Company website URL (optional)',
    example: 'https://albaly.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({
    description: 'Primary email address (optional)',
    example: 'info@albaly.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @ApiProperty({
    description: 'Primary phone number (optional)',
    example: '+66-2-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @ApiProperty({
    description: 'Address line 1 (optional)',
    example: '123 Sukhumvit Road',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({
    description: 'Province (optional)',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({
    description: 'Country code (optional)',
    example: 'TH',
    required: false,
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({
    description: 'Company tags (optional)',
    example: ['technology', 'software', 'digital'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}
