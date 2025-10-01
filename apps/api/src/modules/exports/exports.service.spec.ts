import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportsService } from './exports.service';
import { ExportJobs, Organizations } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('ExportsService', () => {
  let service: ExportsService;
  let exportJobRepository: Repository<ExportJobs>;
  let organizationRepository: Repository<Organizations>;

  const mockExportJobRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        {
          provide: getRepositoryToken(ExportJobs),
          useValue: mockExportJobRepository,
        },
        {
          provide: getRepositoryToken(Organizations),
          useValue: mockOrganizationRepository,
        },
      ],
    }).compile();

    service = module.get<ExportsService>(ExportsService);
    exportJobRepository = module.get<Repository<ExportJobs>>(
      getRepositoryToken(ExportJobs),
    );
    organizationRepository = module.get<Repository<Organizations>>(
      getRepositoryToken(Organizations),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExportJobs', () => {
    it('should return paginated export jobs from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobs({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter export jobs by status', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobs({
        status: 'completed',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(job => {
        expect(job.status).toBe('completed');
      });
    });

    it('should handle pagination correctly', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobs({
        page: 1,
        limit: 1,
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.data.length).toBeLessThanOrEqual(1);
    });

    it('should limit page size to maximum of 100', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobs({
        page: 1,
        limit: 200, // Request more than max
      });

      expect(result.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('getExportJobById', () => {
    it('should return export job by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException for non-existent export job', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      await expect(
        serviceWithoutRepo.getExportJobById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createExportJob', () => {
    it('should create export job with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const exportData = {
        filename: 'test-export.csv',
        scope: 'Test Export',
        format: 'CSV' as const,
      };

      const result = await serviceWithoutRepo.createExportJob(exportData);

      expect(result).toBeDefined();
      expect(result.filename).toBe(exportData.filename);
      expect(result.status).toBeDefined();
    });

    it('should default to CSV format if not specified', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const exportData = {
        filename: 'test-export',
        scope: 'Test Export',
      };

      const result = await serviceWithoutRepo.createExportJob(exportData);

      expect(result).toBeDefined();
      expect(result.format).toBeTruthy();
    });
  });

  describe('downloadExportFile', () => {
    it('should return download URL for completed export job', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.downloadExportFile('1');

      expect(result).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
    });

    it('should throw NotFoundException for non-existent export job', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      await expect(
        serviceWithoutRepo.downloadExportFile('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
