import {
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsIn,
  Matches,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ===== Tenant/Organization DTOs =====

export class CreateTenantDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Organization slug (URL-friendly identifier)',
    example: 'acme-corp',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Slug is required' })
  @MinLength(2, { message: 'Slug must be at least 2 characters long' })
  @MaxLength(50, { message: 'Slug must not exceed 50 characters' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @ApiPropertyOptional({
    description: 'Organization domain',
    example: 'acme.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Domain must not exceed 255 characters' })
  domain?: string;

  @ApiPropertyOptional({
    description: 'Organization status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'Status must be one of: active, inactive, suspended',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Subscription tier',
    enum: ['basic', 'professional', 'enterprise'],
    default: 'basic',
  })
  @IsOptional()
  @IsIn(['basic', 'professional', 'enterprise'], {
    message:
      'Subscription tier must be one of: basic, professional, enterprise',
  })
  subscriptionTier?: string;

  @ApiPropertyOptional({
    description: 'Admin user email for the new tenant',
    example: 'admin@acme.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid admin email address' })
  @MaxLength(255, { message: 'Admin email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  adminEmail?: string;

  @ApiPropertyOptional({
    description: 'Admin user name for the new tenant',
    example: 'John Admin',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Admin name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Admin name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  adminName?: string;

  @ApiPropertyOptional({
    description: 'Admin user password (if creating admin user)',
    example: 'SecurePassword123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  adminPassword?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'Organization name',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Organization domain',
    example: 'acme.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Domain must not exceed 255 characters' })
  domain?: string;

  @ApiPropertyOptional({
    description: 'Organization status',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'Status must be one of: active, inactive, suspended',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Subscription tier',
    enum: ['basic', 'professional', 'enterprise'],
  })
  @IsOptional()
  @IsIn(['basic', 'professional', 'enterprise'], {
    message:
      'Subscription tier must be one of: basic, professional, enterprise',
  })
  subscriptionTier?: string;
}

// ===== Platform User DTOs =====

export class CreatePlatformUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'jane.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description:
      'User password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'SecurePassword123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    description: 'Organization ID for the user',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4, { message: 'Organization ID must be a valid UUID' })
  organizationId: string;

  @ApiPropertyOptional({
    description: 'Role ID to assign to the user',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId?: string;

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'Status must be one of: active, inactive, suspended',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Avatar URL must not exceed 255 characters' })
  avatarUrl?: string;
}

export class UpdatePlatformUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'Status must be one of: active, inactive, suspended',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Avatar URL must not exceed 255 characters' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Role ID to assign to the user',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Role ID must be a valid UUID' })
  roleId?: string;
}

// ===== Shared Company DTOs =====

export class UpdateSharedCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name in English',
    example: 'Albaly Digital Co., Ltd.',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
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
  // primaryRegistrationNo is now managed via company_registrations

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
  @IsString()
  @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Primary email address',
    example: 'info@albaly.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
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
    description: 'Primary region ID (foreign key to ref_regions table)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  primaryRegionId?: string;

  @ApiPropertyOptional({
    description: 'Company size category',
    enum: ['micro', 'small', 'medium', 'large', 'enterprise'],
    example: 'medium',
  })
  @IsOptional()
  @IsIn(['micro', 'small', 'medium', 'large', 'enterprise'], {
    message: 'Invalid company size',
  })
  companySize?: string;

  @ApiPropertyOptional({
    description: 'Estimated employee count',
    example: 50,
    minimum: 1,
    maximum: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Employee count must be a number' })
  @Min(1, { message: 'Employee count must be at least 1' })
  @Max(1000000, { message: 'Employee count must not exceed 1,000,000' })
  employeeCountEstimate?: number;

  @ApiPropertyOptional({
    description: 'Data sensitivity level',
    enum: ['public', 'standard', 'confidential', 'restricted'],
    example: 'standard',
  })
  @IsOptional()
  @IsIn(['public', 'standard', 'confidential', 'restricted'], {
    message: 'Invalid data sensitivity level',
  })
  dataSensitivity?: string;

  @ApiPropertyOptional({
    description: 'Whether the company is shared data',
  })
  @IsOptional()
  isSharedData?: boolean;

  @ApiPropertyOptional({
    description: 'Verification status',
    enum: ['verified', 'unverified', 'disputed', 'inactive'],
  })
  @IsOptional()
  @IsIn(['verified', 'unverified', 'disputed', 'inactive'], {
    message:
      'Verification status must be one of: verified, unverified, disputed, inactive',
  })
  verificationStatus?: string;
}
