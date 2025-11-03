import { IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ImportFileType {
  CSV = 'CSV',
  XLSX = 'XLSX',
}

export enum ImportEntityType {
  COMPANIES = 'companies',
  CONTACTS = 'contacts',
  ACTIVITIES = 'activities',
}

export class CreateImportJobDto {
  @ApiProperty({ description: 'Name of the uploaded file' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'Organization ID', required: false })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({
    description: 'User ID who uploaded the file',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @ApiProperty({
    description: 'Type of file',
    enum: ImportFileType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ImportFileType)
  fileType?: ImportFileType;

  @ApiProperty({
    description: 'Entity type to import',
    enum: ImportEntityType,
    default: ImportEntityType.COMPANIES,
  })
  @IsEnum(ImportEntityType)
  entityType: ImportEntityType;
}

export class UploadImportFileDto {
  @ApiProperty({ description: 'Organization ID', required: false })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({
    description: 'Entity type to import',
    enum: ImportEntityType,
    default: ImportEntityType.COMPANIES,
  })
  @IsEnum(ImportEntityType)
  entityType: ImportEntityType;
}

export class PreviewImportDto {
  @ApiProperty({ description: 'Filter by column values', required: false })
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Page number for pagination', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', required: false })
  @IsOptional()
  limit?: number;
}

export class ExecuteImportDto {
  @ApiProperty({
    description: 'Row indices to import (empty = all)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  rowIndices?: number[];

  @ApiProperty({ description: 'Skip rows with errors', default: true })
  @IsOptional()
  skipErrors?: boolean;
}

export class ImportValidationError {
  @ApiProperty()
  row: number;

  @ApiProperty()
  column: string;

  @ApiProperty()
  value?: any;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  severity: 'error' | 'warning';
}

export class ImportPreviewRow {
  @ApiProperty()
  rowIndex: number;

  @ApiProperty()
  data: Record<string, any>;

  @ApiProperty({ type: [ImportValidationError], required: false })
  errors?: ImportValidationError[];

  @ApiProperty({ type: [ImportValidationError], required: false })
  warnings?: ImportValidationError[];

  @ApiProperty()
  isValid: boolean;
}

export class ImportPreviewResponse {
  @ApiProperty({ type: [ImportPreviewRow] })
  rows: ImportPreviewRow[];

  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  validRows: number;

  @ApiProperty()
  invalidRows: number;

  @ApiProperty({ type: [ImportValidationError] })
  globalErrors: ImportValidationError[];

  @ApiProperty()
  columns: string[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
