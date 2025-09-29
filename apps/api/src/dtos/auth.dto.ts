import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  IsUUID, 
  MinLength, 
  MaxLength,
  Matches,
  IsJWT,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@albaly.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password',
    minLength: 6,
    maxLength: 128
  })
  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'Remember login for extended session',
    default: false
  })
  @IsOptional()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString({ message: 'Refresh token is required' })
  @IsJWT({ message: 'Invalid refresh token format' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'current_password',
    minLength: 6,
    maxLength: 128
  })
  @IsString({ message: 'Current password is required' })
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Current password must not exceed 128 characters' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters, must contain uppercase, lowercase, and number)',
    example: 'NewSecurePassword123',
    minLength: 8,
    maxLength: 128
  })
  @IsString({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePassword123'
  })
  @IsString({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'abc123def456...'
  })
  @IsString({ message: 'Reset token is required' })
  @MinLength(32, { message: 'Invalid reset token' })
  token: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'NewSecurePassword123',
    minLength: 8,
    maxLength: 128
  })
  @IsString({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePassword123'
  })
  @IsString({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'SecurePassword123',
    minLength: 8,
    maxLength: 128
  })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @ApiProperty({
    description: 'Organization ID for the user',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID(4, { message: 'Organization ID must be a valid UUID' })
  organizationId: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Avatar URL must not exceed 255 characters' })
  avatarUrl?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Avatar URL must not exceed 255 characters' })
  avatarUrl?: string;
}