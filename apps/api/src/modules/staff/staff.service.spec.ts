import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffService } from './staff.service';
import { Users, Organizations, UserRoles, Roles } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('StaffService', () => {
  let service: StaffService;
  let userRepository: Repository<Users>;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockUserRolesRepository = {
    find: jest.fn(),
  };

  const mockRolesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Organizations),
          useValue: mockOrganizationRepository,
        },
        {
          provide: getRepositoryToken(UserRoles),
          useValue: mockUserRolesRepository,
        },
        {
          provide: getRepositoryToken(Roles),
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStaffMembers', () => {
    it('should return paginated staff members from database', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          lastLoginAt: new Date(),
          createdAt: new Date(),
          organization: { name: 'Test Org' },
          userRoles2: [],
        },
      ];

      mockUserRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 1]),
      });

      const result = await service.getStaffMembers({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      const result = await service.getStaffMembers({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });

  describe('createStaffMember', () => {
    it('should create staff member with database', async () => {
      const staffData = {
        name: 'New Staff',
        email: 'newstaff@example.com',
        role: 'member',
      };

      const mockUser = {
        id: '123',
        ...staffData,
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.createStaffMember(staffData);

      expect(result).toBeDefined();
      expect(result.name).toBe(staffData.name);
      expect(result.email).toBe(staffData.email);
      expect(result.id).toBeDefined();
    });
  });
});
