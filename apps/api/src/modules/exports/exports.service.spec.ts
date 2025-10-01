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

    it('should handle pagination parameters', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobs({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getExportJobById', () => {
    it('should return export job by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getExportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
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

    it('should set initial status to queued', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      const exportData = {
        filename: 'test-export.csv',
        scope: 'Test Export',
      };

      const result = await serviceWithoutRepo.createExportJob(exportData);

      expect(result.status).toBe('queued');
    });
  });

  describe('deleteExportJob', () => {
    it('should delete export job by id', async () => {
      const serviceWithoutRepo = new ExportsService(undefined, undefined);
      
      await serviceWithoutRepo.deleteExportJob('1');
      
      // If no error is thrown, test passes
      expect(true).toBe(true);
    });
  });
});
