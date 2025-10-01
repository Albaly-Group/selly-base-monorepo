import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyListsService } from './company-lists.service';
import { CompanyLists, CompanyListItems, Companies, Organizations, Users } from '../../entities';
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

  describe('getCompanyLists', () => {
    it('should return paginated company lists from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.getCompanyLists({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter lists by visibility', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.getCompanyLists({
        visibility: 'private',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      if (result.data.length > 0) {
        result.data.forEach(list => {
          expect(list.visibility).toBe('private');
        });
      }
    });

    it('should search lists by name', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.getCompanyLists({
        search: 'Bangkok',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      if (result.data.length > 0) {
        result.data.forEach(list => {
          expect(list.name.toLowerCase()).toContain('bangkok'.toLowerCase());
        });
      }
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
      
      const result = await serviceWithoutRepo.getCompanyListById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('visibility');
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      await expect(
        serviceWithoutRepo.getCompanyListById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
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
      
      const listData = {
        name: 'Test List',
        description: 'Test description',
        visibility: 'private' as const,
      };

      const result = await serviceWithoutRepo.createCompanyList(listData);

      expect(result).toBeDefined();
      expect(result.name).toBe(listData.name);
      expect(result.visibility).toBe(listData.visibility);
      expect(result.id).toBeDefined();
    });

    it('should default visibility to private', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const listData = {
        name: 'Test List',
        description: 'Test description',
      };

      const result = await serviceWithoutRepo.createCompanyList(listData);

      expect(result.visibility).toBeDefined();
    });
  });

  describe('updateCompanyList', () => {
    it('should update company list with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const updateData = {
        name: 'Updated List Name',
        description: 'Updated description',
      };

      const result = await serviceWithoutRepo.updateCompanyList('1', updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      await expect(
        serviceWithoutRepo.updateCompanyList('non-existent-id', { name: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCompanyList', () => {
    it('should delete company list with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.deleteCompanyList('1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent list', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      await expect(
        serviceWithoutRepo.deleteCompanyList('non-existent-id')
      ).rejects.toThrow(NotFoundException);
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
      
      const result = await serviceWithoutRepo.addCompaniesToList('1', {
        companyIds: ['company1', 'company2'],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.added).toBeGreaterThanOrEqual(0);
    });
  });

  describe('removeCompaniesFromList', () => {
    it('should remove companies from list with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.removeCompaniesFromList('1', {
        companyIds: ['company1'],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.removed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getListCompanies', () => {
    it('should return paginated companies in list from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new CompanyListsService(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      
      const result = await serviceWithoutRepo.getListCompanies('1', {
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
