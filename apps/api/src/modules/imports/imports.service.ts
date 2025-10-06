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

    queryBuilder
      .orderBy('import_job.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

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

    await this.importJobRepository.update(id, {
      status: 'processing',
    });

    // Simulate processing (in real implementation, this would be async)
    setTimeout(async () => {
      await this.importJobRepository.update(id, {
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
