import {
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsDecimal,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Common validation messages
const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Please provide a valid email address',
  STRING_REQUIRED: 'This field is required',
  UUID_INVALID: 'Please provide a valid UUID',
  URL_INVALID: 'Please provide a valid URL',
  PHONE_INVALID: 'Please provide a valid phone number',
  LENGTH_INVALID: 'Field length is invalid',
  ARRAY_SIZE_INVALID: 'Array size is invalid',
};

// Enums for validation
export enum CompanySize {
  MICRO = 'micro',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export enum DataSource {
  ALBALY_LIST = 'albaly_list',
  DBD_REGISTRY = 'dbd_registry',
  CUSTOMER_INPUT = 'customer_input',
  DATA_ENRICHMENT = 'data_enrichment',
  THIRD_PARTY = 'third_party',
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  NEED_VERIFIED = 'need_verified',
  UNVERIFIED = 'unverified',
}

export enum DataSensitivity {
  PUBLIC = 'public',
  STANDARD = 'standard',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

// Enhanced Company DTOs
export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name in English',
    example: 'Albaly Digital Co., Ltd.',
    minLength: 2,
    maxLength: 255,
  })
  @IsString({ message: VALIDATION_MESSAGES.STRING_REQUIRED })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  companyNameEn: string;

  @ApiPropertyOptional({
    description: 'Company name in Thai',
    example: 'บริษัท อัลบาลี ดิจิทัล จำกัด',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'Thai company name must not exceed 255 characters',
  })
  @Transform(({ value }) => value?.trim())
  companyNameTh?: string;

  @ApiPropertyOptional({
    description: 'Business registration number',
    example: '0105562174634',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  primaryRegistrationNo?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'Digital transformation and software development company',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Business description must not exceed 1000 characters',
  })
  @Transform(({ value }) => value?.trim())
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://albaly.com',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Primary email address',
    example: 'info@albaly.com',
  })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  @MaxLength(255)
  primaryEmail?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '+66-2-123-4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryPhone?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Sukhumvit Road',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Floor 15, Tower A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '10110',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9]+$/, { message: 'Postal code must contain only numbers' })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Company size category',
    enum: CompanySize,
    example: CompanySize.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CompanySize, { message: 'Invalid company size' })
  companySize?: CompanySize;

  @ApiPropertyOptional({
    description: 'Estimated employee count',
    example: 50,
    minimum: 1,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employee count must be a number' })
  @Min(1, { message: 'Employee count must be at least 1' })
  @Max(1000000, { message: 'Employee count must not exceed 1,000,000' })
  employeeCountEstimate?: number;

  @ApiPropertyOptional({
    description: 'Data sensitivity level',
    enum: DataSensitivity,
    example: DataSensitivity.STANDARD,
    default: DataSensitivity.STANDARD,
  })
  @IsOptional()
  @IsEnum(DataSensitivity, { message: 'Invalid data sensitivity level' })
  dataSensitivity?: DataSensitivity;

  @ApiPropertyOptional({
    description: 'Primary industry ID (foreign key to ref_industry_codes)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryIndustryId?: string;

  @ApiPropertyOptional({
    description: 'Primary region ID (foreign key to ref_regions)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryRegionId?: string;

  @ApiPropertyOptional({
    description: 'DUNS number (Dun & Bradstreet identifier)',
    example: '12-345-6789',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dunsNumber?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/company/albaly-digital',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Facebook page URL',
    example: 'https://facebook.com/albaly.digital',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  facebookUrl?: string;

  @ApiPropertyOptional({
    description: 'Company established date',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  establishedDate?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name in English',
    example: 'Albaly Digital Co., Ltd.',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: VALIDATION_MESSAGES.STRING_REQUIRED })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  companyNameEn?: string;

  @ApiPropertyOptional({
    description: 'Company name in Thai',
    example: 'บริษัท อัลบาลี ดิจิทัล จำกัด',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: 'Thai company name must not exceed 255 characters',
  })
  @Transform(({ value }) => value?.trim())
  companyNameTh?: string;

  @ApiPropertyOptional({
    description: 'Business registration number',
    example: '0105562174634',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  primaryRegistrationNo?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'Digital transformation and software development company',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Business description must not exceed 1000 characters',
  })
  @Transform(({ value }) => value?.trim())
  businessDescription?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://albaly.com',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Primary email address',
    example: 'info@albaly.com',
  })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  @MaxLength(255)
  primaryEmail?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '+66-2-123-4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  primaryPhone?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Sukhumvit Road',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  addressLine1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Floor 15, Tower A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  addressLine2?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '10110',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9]+$/, { message: 'Postal code must contain only numbers' })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Company size category',
    enum: CompanySize,
    example: CompanySize.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CompanySize, { message: 'Invalid company size' })
  companySize?: CompanySize;

  @ApiPropertyOptional({
    description: 'Estimated employee count',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Employee count must be a number' })
  @Min(1, { message: 'Employee count must be at least 1' })
  @Max(1000000, { message: 'Employee count must not exceed 1,000,000' })
  employeeCountEstimate?: number;

  @ApiPropertyOptional({
    description: 'Data sensitivity level',
    enum: DataSensitivity,
    example: DataSensitivity.STANDARD,
  })
  @IsOptional()
  @IsEnum(DataSensitivity, { message: 'Invalid data sensitivity level' })
  dataSensitivity?: DataSensitivity;

  @ApiPropertyOptional({
    description: 'Verification status of the company data',
    enum: VerificationStatus,
    example: VerificationStatus.VERIFIED,
  })
  @IsOptional()
  @IsEnum(VerificationStatus, { message: 'Invalid verification status' })
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Primary industry ID (foreign key to ref_industry_codes)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryIndustryId?: string;

  @ApiPropertyOptional({
    description: 'Primary region ID (foreign key to ref_regions)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryRegionId?: string;

  @ApiPropertyOptional({
    description: 'DUNS number (Dun & Bradstreet identifier)',
    example: '12-345-6789',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dunsNumber?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/company/albaly-digital',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Facebook page URL',
    example: 'https://facebook.com/albaly.digital',
  })
  @IsOptional()
  @IsUrl({}, { message: VALIDATION_MESSAGES.URL_INVALID })
  @MaxLength(255)
  facebookUrl?: string;

  @ApiPropertyOptional({
    description: 'Company established date',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  establishedDate?: string;
}

export class CompanySearchDto {
  @ApiPropertyOptional({
    description: 'Search term for company name or description',
    example: 'technology',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Organization ID for scoped search',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Include shared data in results',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  includeSharedData?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by data sensitivity',
    enum: DataSensitivity,
  })
  @IsOptional()
  @IsEnum(DataSensitivity, { message: 'Invalid data sensitivity filter' })
  dataSensitivity?: DataSensitivity;

  @ApiPropertyOptional({
    description: 'Filter by data source',
    enum: DataSource,
  })
  @IsOptional()
  @IsEnum(DataSource, { message: 'Invalid data source filter' })
  dataSource?: DataSource;

  @ApiPropertyOptional({
    description: 'Filter by verification status',
    enum: VerificationStatus,
  })
  @IsOptional()
  @IsEnum(VerificationStatus, { message: 'Invalid verification status filter' })
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Filter by company size',
    enum: CompanySize,
  })
  @IsOptional()
  @IsEnum(CompanySize, { message: 'Invalid company size filter' })
  companySize?: CompanySize;

  @ApiPropertyOptional({
    description: 'Filter by industry classification',
    example: 'Manufacturing',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  industrial?: string;

  @ApiPropertyOptional({
    description: 'Filter by province name',
    example: 'Bangkok',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  province?: string;

  @ApiPropertyOptional({
    description: 'Filter by primary industry ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryIndustryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by primary region ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  primaryRegionId?: string;
}

export class BulkCompanyIdsDto {
  @ApiProperty({
    description: 'Array of company UUIDs',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one company ID is required' })
  @ArrayMaxSize(100, {
    message: 'Maximum 100 company IDs are allowed per request',
  })
  @IsUUID(4, { each: true, message: 'Each company ID must be a valid UUID' })
  ids: string[];

  @ApiPropertyOptional({
    description: 'Organization ID for access control',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  organizationId?: string;
}

export class BulkCreateCompaniesDto {
  @ApiProperty({
    description: 'Array of companies to create',
    type: [CreateCompanyDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one company is required' })
  @ArrayMaxSize(200, {
    message: 'Maximum 200 companies are allowed per request',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyDto)
  companies: CreateCompanyDto[];

  @ApiPropertyOptional({
    description: 'Optional organization ID to scope creation (server will enforce permissions)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: VALIDATION_MESSAGES.UUID_INVALID })
  organizationId?: string;
}
