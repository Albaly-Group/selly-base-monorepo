import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportsService } from './imports.service';
import { ImportJobs, Organizations, Companies } from '../../entities';
import { NotFoundException } from '@nestjs/common';
import { FileParserService } from './file-parser.service';
import { TemplateService } from './template.service';

describe('ImportsService', () => {
  let service: ImportsService;
  let importJobRepository: Repository<ImportJobs>;
  let organizationRepository: Repository<Organizations>;
  let companyRepository: Repository<Companies>;
  let fileParserService: FileParserService;
  let templateService: TemplateService;

  const mockImportJobRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockCompanyRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockFileParserService = {
    parseFile: jest.fn(),
    validateRow: jest.fn(),
    mapRowToEntity: jest.fn(),
  };

  const mockTemplateService = {
    getColumnMapping: jest.fn(),
    generateCSVTemplate: jest.fn(),
    generateXLSXTemplate: jest.fn(),
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
        {
          provide: getRepositoryToken(Companies),
          useValue: mockCompanyRepository,
        },
        {
          provide: FileParserService,
          useValue: mockFileParserService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
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
    companyRepository = module.get<Repository<Companies>>(
      getRepositoryToken(Companies),
    );
    fileParserService = module.get<FileParserService>(FileParserService);
    templateService = module.get<TemplateService>(TemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getImportJobs', () => {
    it('should return paginated import jobs from database', async () => {
      const mockJobs = [
        {
          id: '1',
          filename: 'test.csv',
          status: 'completed',
          uploadedBy: 'user1',
          organization: { id: 'org1', name: 'Test Org' },
        },
      ];

      mockImportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockJobs, 1]),
      });

      const result = await service.getImportJobs({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter import jobs by status from database', async () => {
      const mockJobs = [
        {
          id: '1',
          filename: 'test.csv',
          status: 'completed',
          uploadedBy: 'user1',
        },
      ];

      mockImportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockJobs, 1]),
      });

      const result = await service.getImportJobs({
        status: 'completed',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(mockImportJobRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle pagination parameters', async () => {
      mockImportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.getImportJobs({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getImportJobById', () => {
    it('should return import job by id from database', async () => {
      const mockJob = {
        id: '1',
        filename: 'test.csv',
        status: 'completed',
        uploadedBy: 'user1',
      };

      mockImportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockJob),
      });

      const result = await service.getImportJobById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });
  });

  describe('createImportJob', () => {
    it('should create import job using database', async () => {
      const importData = {
        filename: 'test-import.csv',
        uploadedBy: 'test@example.com',
      };

      const mockJob = {
        id: '123',
        ...importData,
        status: 'queued',
      };

      mockImportJobRepository.create.mockReturnValue(mockJob);
      mockImportJobRepository.save.mockResolvedValue(mockJob);

      const result = await service.createImportJob(importData);

      expect(result).toBeDefined();
      expect(result.filename).toBe(importData.filename);
      expect(result.status).toBeDefined();
      expect(mockImportJobRepository.create).toHaveBeenCalled();
    });

    it('should set initial status to queued', async () => {
      const importData = {
        filename: 'test-import.csv',
      };

      const mockJob = {
        id: '123',
        ...importData,
        status: 'queued',
      };

      mockImportJobRepository.create.mockReturnValue(mockJob);
      mockImportJobRepository.save.mockResolvedValue(mockJob);

      const result = await service.createImportJob(importData);

      expect(result.status).toBe('queued');
    });
  });

  describe('executeImportJob', () => {
    it('should execute import job using database', async () => {
      const mockJob = {
        id: '1',
        filename: 'test.csv',
        status: 'queued',
        uploadedBy: 'user1',
      };

      mockImportJobRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockJob),
      });
      mockImportJobRepository.save.mockResolvedValue({
        ...mockJob,
        status: 'processing',
      });

      const result = await service.executeImportJob('1');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
    });
  });
});
