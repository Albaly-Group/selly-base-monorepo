import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from './companies.service';
import { Companies, Organizations } from '../../entities';
import { AuditService } from '../audit/audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: Repository<Companies>;
  let organizationRepository: Repository<Organizations>;
  let auditService: AuditService;

  const mockCompanyRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockAuditService = {
    logCompanyAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Companies),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(Organizations),
          useValue: mockOrganizationRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get<Repository<Companies>>(
      getRepositoryToken(Companies),
    );
    organizationRepository = module.get<Repository<Organizations>>(
      getRepositoryToken(Organizations),
    );
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchCompanies', () => {
    it('should return paginated companies from mock data when repository is not available', async () => {
      // Create service without repository to test mock data fallback
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const result = await serviceWithoutRepo.searchCompanies({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter companies by keyword in mock data', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const result = await serviceWithoutRepo.searchCompanies({
        keyword: 'Tech',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      // All results should contain 'Tech' in some field
      result.data.forEach((company) => {
        const searchableText =
          `${company.nameEn} ${company.nameTh} ${company.businessDescription}`.toLowerCase();
        expect(searchableText).toContain('tech'.toLowerCase());
      });
    });

    it('should handle pagination correctly', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const result = await serviceWithoutRepo.searchCompanies({
        page: 1,
        limit: 1,
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getCompanyById', () => {
    it('should return shared company data without user', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      // Company with id '123e4567-e89b-12d3-a456-426614174002' is shared (isSharedData: true)
      const result = await serviceWithoutRepo.getCompanyById(
        '123e4567-e89b-12d3-a456-426614174002',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result.isSharedData).toBe(true);
    });

    it('should throw NotFoundException for non-existent company', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      await expect(
        serviceWithoutRepo.getCompanyById('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCompany', () => {
    it('should create company with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
        email: 'test@example.com',
      };

      const createDto = {
        nameEn: 'Test Company',
        nameTh: 'บริษัททดสอบ',
        province: 'Bangkok',
      };

      const result = await serviceWithoutRepo.createCompany(
        createDto,
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      // Mock implementation returns a company object
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException when user is missing', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const createDto = {
        nameEn: 'Test Company',
        nameTh: 'บริษัททดสอบ',
        province: 'Bangkok',
      };

      await expect(
        serviceWithoutRepo.createCompany(createDto, null as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCompany', () => {
    it('should update company with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const mockUser: any = {
        id: 'user1',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
      };

      const updateDto = {
        nameEn: 'Updated Company Name',
      };

      const result = await serviceWithoutRepo.updateCompany(
        '123e4567-e89b-12d3-a456-426614174001',
        updateDto,
        mockUser,
      );

      expect(result).toBeDefined();
      // Mock implementation returns a company object
      expect(result).toHaveProperty('id');
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should throw BadRequestException when user is missing', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      await expect(
        serviceWithoutRepo.updateCompany(
          '123e4567-e89b-12d3-a456-426614174001',
          { nameEn: 'Test' },
          null as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      const mockUser: any = {
        id: 'user1',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
      };

      await serviceWithoutRepo.deleteCompany(
        '123e4567-e89b-12d3-a456-426614174001',
        mockUser,
      );

      // If no error is thrown, test passes
      expect(true).toBe(true);
    });

    it('should throw BadRequestException when user is missing', async () => {
      const serviceWithoutRepo = new CompaniesService(
        undefined,
        undefined,
        undefined,
      );

      await expect(
        serviceWithoutRepo.deleteCompany(
          '123e4567-e89b-12d3-a456-426614174001',
          null as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
