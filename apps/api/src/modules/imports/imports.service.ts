import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ImportJobs,
  Organizations,
  Users,
  Companies,
  ImportJobs as ImportJob,
  Organizations as Organization,
  Users as User,
} from '../../entities';
import { FileParserService } from './file-parser.service';
import { TemplateService } from './template.service';
import {
  ImportEntityType,
  ImportPreviewResponse,
  ImportPreviewRow,
  ImportValidationError,
} from '../../dtos/import.dto';

@Injectable()
export class ImportsService {
  // PRODUCTION NOTE: In-memory storage is not suitable for production use:
  // - Data is lost on service restart
  // - Can cause memory exhaustion with large files or many concurrent uploads
  // - Not suitable for multi-instance deployments
  // TODO: Replace with persistent storage solution (S3, Azure Blob, local file system with shared volume)
  private fileDataCache: Map<string, { buffer: Buffer; parsedData: any }> =
    new Map();

  constructor(
    @InjectRepository(ImportJobs)
    private readonly importJobRepository: Repository<ImportJobs>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
    @InjectRepository(Companies)
    private readonly companyRepository: Repository<Companies>,
    private readonly fileParserService: FileParserService,
    private readonly templateService: TemplateService,
  ) {}

  async getImportJobs(params?: {
    status?: string;
    page?: number;
    limit?: number;
    organizationId?: string;
  }) {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Database implementation only - no mock data fallback
    const queryBuilder = this.importJobRepository
      .createQueryBuilder('import_job')
      .leftJoinAndSelect('import_job.organization', 'organization')
      .leftJoinAndSelect('import_job.uploadedBy2', 'user');

    if (params?.status) {
      queryBuilder.andWhere('import_job.status = :status', {
        status: params.status,
      });
    }

    if (params?.organizationId) {
      queryBuilder.andWhere('import_job.organizationId = :orgId', {
        orgId: params.organizationId,
      });
    }

    queryBuilder.orderBy('import_job.createdAt', 'DESC').skip(skip).take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async createImportJob(
    importData: {
      filename: string;
      organizationId?: string;
      uploadedBy?: string;
      entityType?: string;
    },
    fileBuffer?: Buffer,
  ) {
    // Parse file if provided
    let totalRecords = 0;
    if (fileBuffer) {
      const parsedData = await this.fileParserService.parseFile(
        fileBuffer,
        importData.filename,
      );
      totalRecords = parsedData.totalRows;

      // Store parsed data temporarily
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      this.fileDataCache.set(tempId, {
        buffer: fileBuffer,
        parsedData,
      });

      // Create import job
      const importJob = this.importJobRepository.create({
        filename: importData.filename,
        organizationId: importData.organizationId,
        uploadedBy: importData.uploadedBy,
        status: 'uploaded',
        totalRecords,
        metadata: {
          entityType: importData.entityType || ImportEntityType.COMPANIES,
          tempId,
        },
      });

      const saved = await this.importJobRepository.save(importJob);

      // Update cache with actual job ID
      const cacheData = this.fileDataCache.get(tempId);
      if (cacheData) {
        this.fileDataCache.set(saved.id, cacheData);
        this.fileDataCache.delete(tempId);

        // Update metadata with actual ID
        await this.importJobRepository.update(saved.id, {
          metadata: {
            entityType: importData.entityType || ImportEntityType.COMPANIES,
          },
        });
      }

      return saved;
    }

    // Legacy path without file buffer
    const importJob = this.importJobRepository.create({
      filename: importData.filename,
      organizationId: importData.organizationId,
      uploadedBy: importData.uploadedBy,
      status: 'queued',
      metadata: {
        entityType: importData.entityType || ImportEntityType.COMPANIES,
      },
    });

    const saved = await this.importJobRepository.save(importJob);
    return saved;
  }

  async getImportJobById(id: string, organizationId?: string) {
    // Database implementation only - no mock data fallback
    const queryBuilder = this.importJobRepository
      .createQueryBuilder('import_job')
      .leftJoinAndSelect('import_job.organization', 'organization')
      .leftJoinAndSelect('import_job.uploadedBy2', 'user')
      .where('import_job.id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('import_job.organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const importJob = await queryBuilder.getOne();

    if (!importJob) {
      throw new NotFoundException('Import job not found');
    }

    return importJob;
  }

  async validateImportData(id: string, organizationId?: string) {
    const importJob = await this.getImportJobById(id, organizationId);

    // Get cached data
    const cacheData = this.fileDataCache.get(id);
    if (!cacheData) {
      throw new BadRequestException(
        'File data not found. Please re-upload the file.',
      );
    }

    const { parsedData } = cacheData;
    const entityType =
      (importJob.metadata as any)?.entityType || ImportEntityType.COMPANIES;

    // Validate all rows
    const allErrors: ImportValidationError[] = [];
    const allWarnings: ImportValidationError[] = [];
    let validCount = 0;
    let errorCount = 0;

    parsedData.rows.forEach((row: any, index: number) => {
      const rowErrors = this.fileParserService.validateRow(
        row,
        index + 2, // +2 because row 1 is header, so data starts at row 2
        entityType,
      );

      const errors = rowErrors.filter((e) => e.severity === 'error');
      const warnings = rowErrors.filter((e) => e.severity === 'warning');

      if (errors.length > 0) {
        errorCount++;
        allErrors.push(...errors);
      } else {
        validCount++;
      }

      allWarnings.push(...warnings);
    });

    // Update import job with validation results
    await this.importJobRepository.update(id, {
      status: 'validated',
      validRecords: validCount,
      errorRecords: errorCount,
      errors: allErrors.slice(0, 100), // Store first 100 errors
      warnings: allWarnings.slice(0, 100), // Store first 100 warnings
    });

    return {
      id,
      status: 'validated',
      totalRecords: parsedData.totalRows,
      validRecords: validCount,
      errorRecords: errorCount,
      warningCount: allWarnings.length,
      message: 'Validation completed',
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  async getImportPreview(
    id: string,
    organizationId?: string,
    options?: {
      page?: number;
      limit?: number;
      filters?: Record<string, any>;
    },
  ): Promise<ImportPreviewResponse> {
    const importJob = await this.getImportJobById(id, organizationId);

    // Get cached data
    const cacheData = this.fileDataCache.get(id);
    if (!cacheData) {
      throw new BadRequestException(
        'File data not found. Please re-upload the file.',
      );
    }

    const { parsedData } = cacheData;
    const entityType =
      (importJob.metadata as any)?.entityType || ImportEntityType.COMPANIES;

    // Apply pagination
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Get validation results
    let allRows = parsedData.rows;

    // Apply filters if provided
    if (options?.filters && Object.keys(options.filters).length > 0) {
      allRows = allRows.filter((row: any) => {
        return Object.entries(options.filters!).every(([key, value]) => {
          return row[key]
            ?.toString()
            .toLowerCase()
            .includes(value.toString().toLowerCase());
        });
      });
    }

    // Get paginated rows
    const paginatedRows = allRows.slice(skip, skip + limit);

    // Validate and prepare preview rows
    const previewRows: ImportPreviewRow[] = paginatedRows.map(
      (row: any, index: number) => {
        const actualRowIndex = skip + index + 2; // +2 for header row
        const validationErrors = this.fileParserService.validateRow(
          row,
          actualRowIndex,
          entityType,
        );

        const errors = validationErrors.filter((e) => e.severity === 'error');
        const warnings = validationErrors.filter(
          (e) => e.severity === 'warning',
        );

        return {
          rowIndex: actualRowIndex,
          data: row,
          errors,
          warnings,
          isValid: errors.length === 0,
        };
      },
    );

    // Count valid/invalid rows
    const validRows = previewRows.filter((r) => r.isValid).length;
    const invalidRows = previewRows.filter((r) => !r.isValid).length;

    return {
      rows: previewRows,
      totalRows: allRows.length,
      validRows,
      invalidRows,
      globalErrors: [],
      columns: parsedData.columns,
      page,
      limit,
    };
  }

  async executeImportJob(
    id: string,
    organizationId?: string,
    options?: {
      rowIndices?: number[];
      skipErrors?: boolean;
    },
  ) {
    const importJob = await this.getImportJobById(id, organizationId);

    // Get cached data
    const cacheData = this.fileDataCache.get(id);
    if (!cacheData) {
      throw new BadRequestException(
        'File data not found. Please re-upload the file.',
      );
    }

    const { parsedData } = cacheData;
    const entityType =
      (importJob.metadata as any)?.entityType || ImportEntityType.COMPANIES;
    const skipErrors = options?.skipErrors !== false; // Default to true

    // Update status to processing
    await this.importJobRepository.update(id, {
      status: 'processing',
    });

    // PRODUCTION NOTE: setTimeout is not suitable for production use:
    // - No retry mechanism on failure
    // - Cannot monitor or track job progress
    // - Fire-and-forget operation that's not gracefully handled on service shutdown
    // - No distributed processing support
    // TODO: Replace with proper job queue system (Bull, BullMQ, etc.)
    void setTimeout(async () => {
      try {
        let processedCount = 0;
        let errorCount = 0;
        const importErrors: ImportValidationError[] = [];

        // Determine which rows to process
        let rowsToProcess = parsedData.rows;
        if (options?.rowIndices && options.rowIndices.length > 0) {
          rowsToProcess = options.rowIndices.map((idx) => parsedData.rows[idx]);
        }

        // Process each row
        for (let i = 0; i < rowsToProcess.length; i++) {
          const row = rowsToProcess[i];
          const rowIndex = i + 2; // +2 for header

          try {
            // Validate row
            const validationErrors = this.fileParserService.validateRow(
              row,
              rowIndex,
              entityType,
            );

            const hasErrors = validationErrors.some(
              (e) => e.severity === 'error',
            );

            if (hasErrors && skipErrors) {
              errorCount++;
              importErrors.push(
                ...validationErrors.filter((e) => e.severity === 'error'),
              );
              continue;
            }

            if (hasErrors && !skipErrors) {
              throw new Error(`Row ${rowIndex} has validation errors`);
            }

            // Map and save entity
            const entity = this.fileParserService.mapRowToEntity(
              row,
              entityType,
            );

            // Save based on entity type
            if (entityType === ImportEntityType.COMPANIES) {
              await this.saveCompany(entity, organizationId);
            }
            // Add other entity types as needed

            processedCount++;
          } catch (error) {
            errorCount++;
            importErrors.push({
              row: rowIndex,
              column: 'general',
              message: error.message,
              severity: 'error',
            });

            if (!skipErrors) {
              break;
            }
          }
        }

        // Update job status
        await this.importJobRepository.update(id, {
          status: errorCount > 0 ? 'completed_with_errors' : 'completed',
          completedAt: new Date(),
          processedRecords: processedCount,
          errorRecords: errorCount,
          errors: importErrors.slice(0, 100),
        });

        // Clear cache
        this.fileDataCache.delete(id);
      } catch (error) {
        await this.importJobRepository.update(id, {
          status: 'failed',
          errors: [
            {
              row: 0,
              column: 'system',
              message: error.message,
              severity: 'error',
            },
          ],
        });

        // Clear cache
        this.fileDataCache.delete(id);
      }
    }, 100);

    return {
      id,
      status: 'processing',
      message: 'Import job execution started',
    };
  }

  private async saveCompany(data: any, organizationId?: string) {
    // Create company record
    const company = this.companyRepository.create({
      ...data,
      organizationId: organizationId || data.organizationId,
      dataSource: 'import',
      verificationStatus: 'unverified',
    });

    await this.companyRepository.save(company);
  }
}
