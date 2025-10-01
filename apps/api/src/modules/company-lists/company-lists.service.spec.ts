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
    it('should return paginated company lists from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      const result = await serviceWithoutRepo.searchCompanyLists({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      const result = await serviceWithoutRepo.searchCompanyLists({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('getCompanyListById', () => {
    it('should return company list by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      // Use a mock list ID that exists in the mock data
      const result = await serviceWithoutRepo.getCompanyListById(
        '123e4567-e89b-12d3-a456-426614174003',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174003');
    });
  });

  describe('createCompanyList', () => {
    it('should create company list with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      const mockUser: any = {
        id: 'user1',
        organizationId: 'org1',
      };

      const listData = {
        name: 'Test List',
        description: 'Test description',
        visibility: 'private' as const,
      };

      const result = await serviceWithoutRepo.createCompanyList(
        listData,
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('addCompaniesToList', () => {
    it('should add companies to list with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      // Use owner user ID and matching organization ID from mock data
      const mockUser: any = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      };

      // Use a mock list ID that exists in the mock data
      const result = await serviceWithoutRepo.addCompaniesToList(
        '123e4567-e89b-12d3-a456-426614174003',
        ['company1', 'company2'],
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });
});
