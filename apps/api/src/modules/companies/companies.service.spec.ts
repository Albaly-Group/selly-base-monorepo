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
    update: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockAuditService = {
    logCompanyAction: jest.fn(),
    logUserAction: jest.fn(),
    logCompanyOperation: jest.fn(),
    logSearchOperation: jest.fn(),
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
    it('should return paginated companies from database', async () => {
      const mockCompanies = [
        {
          id: '1',
          nameEn: 'Test Company',
          nameTh: 'บริษัททดสอบ',
          province: 'Bangkok',
          organization: { id: 'org1', name: 'Test Org' },
        },
      ];

      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCompanies, 1]),
      });

      const result = await service.searchCompanies({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter companies by keyword from database', async () => {
      const mockCompanies = [
        {
          id: '1',
          nameEn: 'Tech Company',
          nameTh: 'บริษัทเทค',
          province: 'Bangkok',
          organization: { id: 'org1', name: 'Test Org' },
        },
      ];

      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCompanies, 1]),
      });

      const result = await service.searchCompanies({
        searchTerm: 'Tech',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.searchCompanies({
        page: 1,
        limit: 1,
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.data.length).toBeLessThanOrEqual(1);
    });

    it('should filter by attributes without searchTerm', async () => {
      const mockCompanies = [
        {
          id: '1',
          nameEn: 'Manufacturing Company',
          nameTh: 'บริษัทผลิต',
          province: 'Bangkok',
          companySize: 'medium',
          industryClassification: ['Manufacturing'],
          organization: { id: 'org1', name: 'Test Org' },
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCompanies, 1]),
      };

      mockCompanyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchCompanies({
        industrial: 'Manufacturing',
        province: 'Bangkok',
        companySize: 'medium',
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result.data[0].nameEn).toBe('Manufacturing Company');
    });
  });

  describe('getCompanyById', () => {
    it('should return company data from database', async () => {
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        nameEn: 'Test Company',
        isSharedData: true,
        organization: { id: 'org1', name: 'Test Org' },
      };

      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCompany),
      });

      const result = await service.getCompanyById(
        '123e4567-e89b-12d3-a456-426614174002',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result.isSharedData).toBe(true);
    });

    it('should throw NotFoundException for non-existent company', async () => {
      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCompanyById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCompany', () => {
    it('should create company using database', async () => {
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

      const mockCompany = {
        id: '123',
        ...createDto,
        organizationId: mockUser.organizationId,
        createdBy: mockUser.id,
      };

      mockCompanyRepository.create.mockReturnValue(mockCompany);
      mockCompanyRepository.save.mockResolvedValue(mockCompany);

      const result = await service.createCompany(createDto, mockUser);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(mockCompanyRepository.create).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is missing', async () => {
      const createDto = {
        nameEn: 'Test Company',
        nameTh: 'บริษัททดสอบ',
        province: 'Bangkok',
      };

      await expect(
        service.createCompany(createDto, null as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCompany', () => {
    it('should update company using database', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
      };

      const updateDto = {
        nameEn: 'Updated Company Name',
      };

      const existingCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        nameEn: 'Old Name',
        organizationId: mockUser.organizationId,
      };

      const updatedCompany = {
        ...existingCompany,
        ...updateDto,
      };

      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCompany),
      });
      mockCompanyRepository.update.mockResolvedValue({ affected: 1 });
      mockCompanyRepository.findOne.mockResolvedValue(updatedCompany);

      const result = await service.updateCompany(
        '123e4567-e89b-12d3-a456-426614174001',
        updateDto,
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(mockCompanyRepository.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is missing', async () => {
      await expect(
        service.updateCompany(
          '123e4567-e89b-12d3-a456-426614174001',
          { nameEn: 'Test' },
          null as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCompany', () => {
    it('should delete company using database', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
      };

      const existingCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        nameEn: 'Test Company',
        organizationId: mockUser.organizationId,
      };

      mockCompanyRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCompany),
      });
      mockCompanyRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteCompany(
        '123e4567-e89b-12d3-a456-426614174001',
        mockUser,
      );

      expect(mockCompanyRepository.delete).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174001',
      );
    });

    it('should throw BadRequestException when user is missing', async () => {
      await expect(
        service.deleteCompany(
          '123e4567-e89b-12d3-a456-426614174001',
          null as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
