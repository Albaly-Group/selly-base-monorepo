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

    it('should handle pagination parameters', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobs({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getImportJobById', () => {
    it('should return import job by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.getImportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
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

  describe('executeImportJob', () => {
    it('should execute import job from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new ImportsService(undefined, undefined);
      
      const result = await serviceWithoutRepo.executeImportJob('1');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
    });
  });
});
