import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportsService } from './imports.service';
import { ImportJobs, Organizations } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('ImportsService', () => {
  let service: ImportsService;
  let importJobRepository: Repository<ImportJobs>;
  let organizationRepository: Repository<Organizations>;

  const mockImportJobRepository = {
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
        ImportsService,
        {
          provide: getRepositoryToken(ImportJobs),
          useValue: mockImportJobRepository,
        },
        {
          provide: getRepositoryToken(Organizations),
          useValue: mockOrganizationRepository,
        },
      ],
    }).compile();

    service = module.get<ImportsService>(ImportsService);
    importJobRepository = module.get<Repository<ImportJobs>>(
      getRepositoryToken(ImportJobs),
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

  describe('getImportJobs', () => {
    it('should return paginated import jobs from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobs({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter import jobs by status', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobs({
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
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobs({
        page: 1,
        limit: 1,
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.data.length).toBeLessThanOrEqual(1);
    });

    it('should limit page size to maximum of 100', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobs({
        page: 1,
        limit: 200, // Request more than max
      });

      expect(result.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('getImportJobById', () => {
    it('should return import job by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException for non-existent import job', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      await expect(
        serviceWithoutRepo.getImportJobById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createImportJob', () => {
    it('should create import job with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const importData = {
        filename: 'test-import.csv',
        uploadedBy: 'test@example.com',
      };

      const result = await serviceWithoutRepo.createImportJob(importData);

      expect(result).toBeDefined();
      expect(result.filename).toBe(importData.filename);
      expect(result.status).toBeDefined();
    });

    it('should set initial status to queued', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const importData = {
        filename: 'test-import.csv',
      };

      const result = await serviceWithoutRepo.createImportJob(importData);

      expect(result.status).toBe('queued');
    });
  });

  describe('updateImportJobStatus', () => {
    it('should update import job status from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.updateImportJobStatus('1', {
        status: 'processing',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('processing');
    });

    it('should throw NotFoundException for non-existent import job', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      await expect(
        serviceWithoutRepo.updateImportJobStatus('non-existent-id', {
          status: 'processing',
        })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
