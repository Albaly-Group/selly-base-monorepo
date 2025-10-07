import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    getOrganizationUsers: jest.fn(),
    createOrganizationUser: jest.fn(),
    updateOrganizationUser: jest.fn(),
    deleteOrganizationUser: jest.fn(),
    getOrganizationPolicies: jest.fn(),
    updateOrganizationPolicies: jest.fn(),
    getIntegrationSettings: jest.fn(),
    updateIntegrationSettings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrganizationUsers', () => {
    it('should return paginated organization users', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const mockUsers = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockAdminService.getOrganizationUsers.mockResolvedValue(mockUsers);

      const result = await controller.getOrganizationUsers(mockReq);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const mockUsers = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockAdminService.getOrganizationUsers.mockResolvedValue(mockUsers);

      const result = await controller.getOrganizationUsers(mockReq, '1', '10');

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should return users with all required fields', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const mockUsers = {
        data: [
          {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'member',
            status: 'active',
            permissions: [],
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockAdminService.getOrganizationUsers.mockResolvedValue(mockUsers);

      const result = await controller.getOrganizationUsers(mockReq);

      if (result.data.length > 0) {
        const user = result.data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('status');
        expect(user).toHaveProperty('permissions');
      }
    });
  });

  describe('createOrganizationUser', () => {
    it('should create new organization user', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const userData = {
        name: 'New User',
        email: 'newuser@albaly.com',
        role: 'member',
      };

      const mockUser = {
        id: '123',
        ...userData,
        permissions: [],
      };

      mockAdminService.createOrganizationUser.mockResolvedValue(mockUser);

      const result = await controller.createOrganizationUser(mockReq, userData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
    });

    it('should assign default permissions based on role', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const userData = {
        name: 'Test User',
        email: 'test@albaly.com',
        role: 'member',
      };

      const mockUser = {
        id: '123',
        ...userData,
        permissions: ['read:companies'],
      };

      mockAdminService.createOrganizationUser.mockResolvedValue(mockUser);

      const result = await controller.createOrganizationUser(mockReq, userData);

      expect(result.permissions).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);
    });
  });

  describe('updateOrganizationUser', () => {
    it('should update organization user', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'manager',
      };

      const mockUser = {
        id: '1',
        ...updateData,
        email: 'test@example.com',
      };

      mockAdminService.updateOrganizationUser.mockResolvedValue(mockUser);

      const result = await controller.updateOrganizationUser('1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe(updateData.name);
    });
  });

  describe('deleteOrganizationUser', () => {
    it('should delete organization user', async () => {
      const mockResult = {
        message: 'User deleted successfully',
      };

      mockAdminService.deleteOrganizationUser.mockResolvedValue(mockResult);

      const result = await controller.deleteOrganizationUser('1');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('getOrganizationPolicies', () => {
    it('should return organization policies', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const mockPolicies = {
        dataRetention: {},
        accessControl: {},
        dataSharing: {},
        apiAccess: {},
      };

      mockAdminService.getOrganizationPolicies.mockResolvedValue(mockPolicies);

      const result = await controller.getOrganizationPolicies(mockReq);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dataRetention');
      expect(result).toHaveProperty('accessControl');
      expect(result).toHaveProperty('dataSharing');
      expect(result).toHaveProperty('apiAccess');
    });

    it('should return policies with configuration', async () => {
      const mockReq = {
        user: { id: 'user1', organizationId: 'org1' },
      };

      const mockPolicies = {
        dataRetention: { enabled: true },
        accessControl: { enabled: true },
        dataSharing: {},
        apiAccess: {},
      };

      mockAdminService.getOrganizationPolicies.mockResolvedValue(mockPolicies);

      const result = await controller.getOrganizationPolicies(mockReq);

      expect(result.dataRetention).toBeDefined();
      expect(typeof result.dataRetention).toBe('object');
      expect(result.accessControl).toBeDefined();
      expect(typeof result.accessControl).toBe('object');
    });
  });

  describe('updateOrganizationPolicies', () => {
    it('should update organization policies', async () => {
      const policiesData = {
        dataRetention: {
          enabled: true,
          retentionPeriod: 180,
        },
      };

      const mockResult = {
        message: 'Policies updated successfully',
      };

      mockAdminService.updateOrganizationPolicies.mockResolvedValue(mockResult);

      const result = await controller.updateOrganizationPolicies(policiesData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('updated successfully');
    });
  });

  describe('getIntegrationSettings', () => {
    it('should return integration settings', async () => {
      const mockSettings = {
        databases: {},
        apis: {},
        exports: {},
      };

      mockAdminService.getIntegrationSettings.mockResolvedValue(mockSettings);

      const result = await controller.getIntegrationSettings();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('databases');
      expect(result).toHaveProperty('apis');
      expect(result).toHaveProperty('exports');
    });

    it('should return database connections', async () => {
      const mockSettings = {
        databases: {
          enabled: true,
          connections: [],
        },
        apis: {},
        exports: {},
      };

      mockAdminService.getIntegrationSettings.mockResolvedValue(mockSettings);

      const result = await controller.getIntegrationSettings();

      expect(result.databases).toBeDefined();
      expect(result.databases).toHaveProperty('enabled');
      expect(result.databases).toHaveProperty('connections');
      expect(Array.isArray(result.databases.connections)).toBe(true);
    });
  });

  describe('updateIntegrationSettings', () => {
    it('should update integration settings', async () => {
      const settingsData = {
        databases: {
          enabled: true,
        },
      };

      const mockResult = {
        message: 'Settings updated successfully',
      };

      mockAdminService.updateIntegrationSettings.mockResolvedValue(mockResult);

      const result = await controller.updateIntegrationSettings(settingsData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('updated successfully');
    });
  });
});
