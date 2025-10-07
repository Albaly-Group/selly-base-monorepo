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
    it('should return paginated export jobs from database', async () => {
      const mockJobs = [
        {
          id: '1',
          filename: 'test-export.csv',
          status: 'completed',
          scope: 'Test Export',
          organization: { id: 'org1', name: 'Test Org' },
        },
      ];

      mockExportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockJobs, 1]),
      });

      const result = await service.getExportJobs({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter export jobs by status from database', async () => {
      const mockJobs = [
        {
          id: '1',
          filename: 'test-export.csv',
          status: 'completed',
          scope: 'Test Export',
        },
      ];

      mockExportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockJobs, 1]),
      });

      const result = await service.getExportJobs({
        status: 'completed',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(mockExportJobRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      mockExportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.getExportJobs({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getExportJobById', () => {
    it('should return export job by id from database', async () => {
      const mockJob = {
        id: '1',
        filename: 'test-export.csv',
        status: 'completed',
        scope: 'Test Export',
      };

      mockExportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockJob),
      });

      const result = await service.getExportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });
  });

  describe('createExportJob', () => {
    it('should create export job using database', async () => {
      const exportData = {
        filename: 'test-export.csv',
        scope: 'Test Export',
        format: 'CSV' as const,
      };

      const mockJob = {
        id: '123',
        ...exportData,
        status: 'queued',
      };

      mockExportJobRepository.create.mockReturnValue(mockJob);
      mockExportJobRepository.save.mockResolvedValue(mockJob);

      const result = await service.createExportJob(exportData);

      expect(result).toBeDefined();
      expect(result.filename).toBe(exportData.filename);
      expect(result.status).toBeDefined();
      expect(mockExportJobRepository.create).toHaveBeenCalled();
    });

    it('should set initial status to queued', async () => {
      const exportData = {
        filename: 'test-export.csv',
        scope: 'Test Export',
      };

      const mockJob = {
        id: '123',
        ...exportData,
        status: 'queued',
      };

      mockExportJobRepository.create.mockReturnValue(mockJob);
      mockExportJobRepository.save.mockResolvedValue(mockJob);

      const result = await service.createExportJob(exportData);

      expect(result.status).toBe('queued');
    });
  });

  describe('deleteExportJob', () => {
    it('should delete export job by id using database', async () => {
      mockExportJobRepository.createQueryBuilder.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      });

      await service.deleteExportJob('1');

      expect(mockExportJobRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
