import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExportJobs,
  Organizations,
  Users,
  ExportJobs as ExportJob,
  Organizations as Organization,
  Users as User,
} from '../../entities';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(ExportJobs)
    private readonly exportJobRepository: Repository<ExportJobs>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
  ) {}

  async getExportJobs(params?: {
    status?: string;
    page?: number;
    limit?: number;
    organizationId?: string;
  }) {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 50, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.exportJobRepository
      .createQueryBuilder('export_job')
      .leftJoinAndSelect('export_job.organization', 'organization')
      .leftJoinAndSelect('export_job.requestedBy2', 'user');

    if (params?.status) {
      queryBuilder.andWhere('export_job.status = :status', {
        status: params.status,
      });
    }

    if (params?.organizationId) {
      queryBuilder.andWhere('export_job.organizationId = :orgId', {
        orgId: params.organizationId,
      });
    }

    queryBuilder
      .orderBy('export_job.createdAt', 'DESC')
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

  async createExportJob(exportData: {
    filename: string;
    scope?: string;
    format?: 'CSV' | 'Excel' | 'JSON';
    organizationId?: string;
    requestedBy?: string;
  }) {
    const exportJob = this.exportJobRepository.create({
      filename: exportData.filename,
      scope: exportData.scope,
      format: exportData.format || 'CSV',
      organizationId: exportData.organizationId,
      requestedBy: exportData.requestedBy,
      status: 'queued',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const saved = await this.exportJobRepository.save(exportJob);
    return saved;
  }

  async getExportJobById(id: string, organizationId?: string) {
    const queryBuilder = this.exportJobRepository
      .createQueryBuilder('export_job')
      .leftJoinAndSelect('export_job.organization', 'organization')
      .leftJoinAndSelect('export_job.requestedBy2', 'user')
      .where('export_job.id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('export_job.organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const exportJob = await queryBuilder.getOne();

    if (!exportJob) {
      throw new NotFoundException('Export job not found');
    }

    return exportJob;
  }

  async deleteExportJob(id: string, organizationId?: string) {
    const queryBuilder = this.exportJobRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const result = await queryBuilder.execute();

    if (result.affected === 0) {
      throw new NotFoundException('Export job not found');
    }

    return { message: `Export job ${id} cancelled successfully` };
  }

  async downloadExportFile(id: string, organizationId?: string) {
    const exportJob = await this.getExportJobById(id, organizationId);

    if (exportJob.status !== 'completed') {
      throw new NotFoundException('Export file not ready or not found');
    }

    if (!exportJob.downloadUrl) {
      throw new NotFoundException('Export file location not found');
    }

    return {
      downloadUrl: exportJob.downloadUrl,
      filename: exportJob.filename,
      format: exportJob.format,
      fileSize: exportJob.fileSize,
      contentType: exportJob.format === 'CSV' ? 'text/csv' : 
                   exportJob.format === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                   'application/json',
    };
  }
}
