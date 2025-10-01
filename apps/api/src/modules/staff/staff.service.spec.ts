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
    it('should return paginated staff members from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const result = await serviceWithoutRepo.getStaffMembers({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter staff by role', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const result = await serviceWithoutRepo.getStaffMembers({
        role: 'admin',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      // All results should be admin role if filtering works
      if (result.data.length > 0) {
        result.data.forEach(staff => {
          expect(staff.role).toBe('admin');
        });
      }
    });

    it('should search staff by name or email', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const result = await serviceWithoutRepo.getStaffMembers({
        search: 'admin',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      if (result.data.length > 0) {
        result.data.forEach(staff => {
          const searchableText = `${staff.name} ${staff.email}`.toLowerCase();
          expect(searchableText).toContain('admin');
        });
      }
    });
  });

  describe('getStaffMemberById', () => {
    it('should return staff member by id from mock data when repository is not available', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const result = await serviceWithoutRepo.getStaffMemberById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException for non-existent staff member', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      await expect(
        serviceWithoutRepo.getStaffMemberById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createStaffMember', () => {
    it('should create staff member with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const staffData = {
        name: 'New Staff',
        email: 'newstaff@example.com',
        role: 'member',
      };

      const result = await serviceWithoutRepo.createStaffMember(staffData);

      expect(result).toBeDefined();
      expect(result.name).toBe(staffData.name);
      expect(result.email).toBe(staffData.email);
      expect(result.id).toBeDefined();
    });
  });

  describe('updateStaffMember', () => {
    it('should update staff member with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const updateData = {
        name: 'Updated Name',
      };

      const result = await serviceWithoutRepo.updateStaffMember('1', updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
    });

    it('should throw NotFoundException for non-existent staff member', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      await expect(
        serviceWithoutRepo.updateStaffMember('non-existent-id', { name: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStaffMember', () => {
    it('should delete staff member with mock data when repository is not available', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      const result = await serviceWithoutRepo.deleteStaffMember('1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent staff member', async () => {
      const serviceWithoutRepo = new StaffService(undefined, undefined, undefined, undefined);
      
      await expect(
        serviceWithoutRepo.deleteStaffMember('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
