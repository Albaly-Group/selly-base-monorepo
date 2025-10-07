import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateCompanyContactDto {
  @ApiProperty({
    description: 'Company UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'First name of the contact',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the contact',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Full name of the contact',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Job title or position',
    example: 'Chief Technology Officer',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Department',
    example: 'Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: 'Seniority level',
    example: 'Executive',
    required: false,
  })
  @IsOptional()
  @IsString()
  seniorityLevel?: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@company.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+66-2-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;
}

export class UpdateCompanyContactDto extends PartialType(
  CreateCompanyContactDto,
) {
  @ApiProperty({
    description: 'Company UUID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({
    description: 'Whether contact has opted out',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOptedOut?: boolean;

  @ApiProperty({
    description: 'Date when contact opted out',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  optOutDate?: Date | null;
}
