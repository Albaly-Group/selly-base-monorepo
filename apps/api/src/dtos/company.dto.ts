import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateCompanyDto {
  @IsString()
  companyNameEn: string;

  @IsOptional()
  @IsString()
  companyNameTh?: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  tags?: string[];
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyNameEn?: string;

  @IsOptional()
  @IsString()
  companyNameTh?: string;

  @IsOptional()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  tags?: string[];
}