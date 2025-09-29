import { IsString, IsOptional, IsIn, IsArray, IsBoolean } from 'class-validator';

export class CreateCompanyListDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['private', 'team', 'organization', 'public'])
  visibility?: 'private' | 'team' | 'organization' | 'public';

  @IsOptional()
  @IsBoolean()
  isSmartList?: boolean;

  @IsOptional()
  smartCriteria?: Record<string, any>;
}

export class UpdateCompanyListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['private', 'team', 'organization', 'public'])
  visibility?: 'private' | 'team' | 'organization' | 'public';

  @IsOptional()
  @IsBoolean()
  isSmartList?: boolean;

  @IsOptional()
  smartCriteria?: Record<string, any>;
}

export class AddCompaniesToListDto {
  @IsArray()
  @IsString({ each: true })
  companyIds: string[];
}

export class RemoveCompaniesFromListDto {
  @IsArray()
  @IsString({ each: true })
  companyIds: string[];
}