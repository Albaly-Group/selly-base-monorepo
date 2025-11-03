import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
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
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'SecurePassword123',
    minLength: 6,
    maxLength: 128,
  })
  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'User role within the organization',
    example: 'user',
    enum: ['user', 'staff', 'customer_admin'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['user', 'staff', 'customer_admin'], {
    message: 'Role must be one of: user, staff, customer_admin',
  })
  role?: string;
}

export class UpdateOrganizationUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'User role within the organization',
    example: 'user',
    enum: ['user', 'staff', 'customer_admin'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['user', 'staff', 'customer_admin'], {
    message: 'Role must be one of: user, staff, customer_admin',
  })
  role?: string;

  @ApiPropertyOptional({
    description: 'User status',
    example: 'active',
    enum: ['active', 'suspended'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'suspended'], {
    message: 'Status must be either active or suspended',
  })
  status?: string;
}
