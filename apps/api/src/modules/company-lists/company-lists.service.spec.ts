import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyListsService } from './company-lists.service';
import {
  CompanyLists,
  CompanyListItems,
  Companies,
  Organizations,
  Users,
} from '../../entities';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CompanyListsService', () => {
  let service: CompanyListsService;
  let companyListsRepository: Repository<CompanyLists>;

  const mockCompanyListsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompanyListItemsRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompaniesRepository = {
    findOne: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockOrganizationsRepository = {
    findOne: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyListsService,
        {
          provide: getRepositoryToken(CompanyLists),
          useValue: mockCompanyListsRepository,
        },
        {
          provide: getRepositoryToken(CompanyListItems),
          useValue: mockCompanyListItemsRepository,
        },
        {
          provide: getRepositoryToken(Companies),
          useValue: mockCompaniesRepository,
        },
        {
          provide: getRepositoryToken(Organizations),
          useValue: mockOrganizationsRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyListsService>(CompanyListsService);
    companyListsRepository = module.get<Repository<CompanyLists>>(
      getRepositoryToken(CompanyLists),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchCompanyLists', () => {
    it('should return paginated company lists from database', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
      };

      const mockLists = [
        {
          id: '1',
          name: 'Test List',
          description: 'Test description',
          visibility: 'private',
          createdBy2: { id: 'user1', name: 'Test User' },
        },
      ];

      mockCompanyListsRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockLists, 1]),
      });

      const result = await service.searchCompanyLists(
        {
          page: 1,
          limit: 10,
        },
        mockUser,
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
      };

      mockCompanyListsRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.searchCompanyLists(
        {
          page: 2,
          limit: 5,
        },
        mockUser,
      );

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getCompanyListById', () => {
    it('should return company list by id from database', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
      };

      const mockList = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Test List',
        description: 'Test description',
        organizationId: 'org1',
        visibility: 'organization',
        createdBy: 'user1',
        createdBy2: { id: 'user1', name: 'Test User' },
      };

      mockCompanyListsRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockList),
      });

      const result = await service.getCompanyListById(
        '123e4567-e89b-12d3-a456-426614174003',
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174003');
    });
  });

  describe('createCompanyList', () => {
    it('should create company list using database', async () => {
      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
      };

      const listData = {
        name: 'Test List',
        description: 'Test description',
        visibility: 'private' as const,
      };

      const mockList = {
        id: '123',
        ...listData,
        organizationId: mockUser.organizationId,
        createdBy: mockUser.id,
      };

      mockCompanyListsRepository.create.mockReturnValue(mockList);
      mockCompanyListsRepository.save.mockResolvedValue(mockList);

      const result = await service.createCompanyList(listData, mockUser);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(mockCompanyListsRepository.create).toHaveBeenCalled();
      expect(mockCompanyListsRepository.save).toHaveBeenCalled();
    });
  });

  describe('addCompaniesToList', () => {
    it('should add companies to list using database', async () => {
      const mockUser: any = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const mockList = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Test List',
        organizationId: mockUser.organizationId,
        visibility: 'organization',
        createdBy: mockUser.id,
      };

      const mockCompanies = [
        { id: 'company1', nameEn: 'Company 1' },
        { id: 'company2', nameEn: 'Company 2' },
      ];

      mockCompanyListsRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockList),
      });
      mockCompaniesRepository.findByIds = jest
        .fn()
        .mockResolvedValue(mockCompanies);
      mockCompanyListItemsRepository.find.mockResolvedValue([]);
      mockCompanyListItemsRepository.create.mockImplementation((item) => item);
      mockCompanyListItemsRepository.save.mockResolvedValue([]);

      const result = await service.addCompaniesToList(
        '123e4567-e89b-12d3-a456-426614174003',
        ['company1', 'company2'],
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });
});
