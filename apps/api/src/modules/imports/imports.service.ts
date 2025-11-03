import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ImportJobs,
  Organizations,
  Users,
  ImportJobs as ImportJob,
  Organizations as Organization,
  Users as User,
} from '../../entities';

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(ImportJobs)
    private readonly importJobRepository: Repository<ImportJobs>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
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

  async createImportJob(importData: {
    filename: string;
    organizationId?: string;
    uploadedBy?: string;
  }) {
    // Database implementation only - no mock data fallback
    const importJob = this.importJobRepository.create({
      filename: importData.filename,
      organizationId: importData.organizationId,
      uploadedBy: importData.uploadedBy,
      status: 'queued',
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

    // NOTE: Current implementation returns mock validation results
    // TODO: Implement actual file parsing and validation logic
    // - Parse CSV/Excel file from storage
    // - Validate each row against schema (required fields, email format, etc.)
    // - Return actual validation errors and warnings
    // See CODE_IMPLEMENTATION_ANALYSIS.md for detailed implementation guide
    
    // Update status to validating
    await this.importJobRepository.update(id, {
      status: 'validating',
      validRecords: 98,
      errorRecords: 2,
      errors: [
        { row: 5, column: 'email', message: 'Invalid email format' },
        {
          row: 12,
          column: 'companyName',
          message: 'Missing company name',
        },
      ],
      warnings: [
        {
          row: 3,
          column: 'phone',
          message: 'Phone number format may be incorrect',
        },
        {
          row: 8,
          column: 'website',
          message: 'Website URL not reachable',
        },
      ],
    });

    return {
      id,
      status: 'validated',
      totalRecords: 100,
      validRecords: 98,
      errorRecords: 2,
      warningCount: 5,
      message: 'Validation completed',
      errors: [
        { row: 5, column: 'email', message: 'Invalid email format' },
        { row: 12, column: 'companyName', message: 'Missing company name' },
      ],
      warnings: [
        {
          row: 3,
          column: 'phone',
          message: 'Phone number format may be incorrect',
        },
        { row: 8, column: 'website', message: 'Website URL not reachable' },
      ],
    };
  }

  async executeImportJob(id: string, organizationId?: string) {
    // NOTE: Current implementation simulates import with setTimeout
    // TODO: Implement actual import processing logic
    // - Read validated file from storage
    // - Parse company data from rows
    // - Create/update company records in database
    // - Track progress and errors per record
    // - Use proper async processing (queue/background job)
    // See CODE_IMPLEMENTATION_ANALYSIS.md for detailed implementation guide
    
    await this.importJobRepository.update(id, {
      status: 'processing',
    });

    // Simulate processing (in real implementation, this would be async)
    setTimeout(() => {
      void this.importJobRepository.update(id, {
        status: 'completed',
        completedAt: new Date(),
        processedRecords: 98,
      });
    }, 1000);

    return {
      id,
      status: 'processing',
      message: 'Import job execution started',
    };
  }
}
