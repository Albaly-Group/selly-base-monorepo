import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrganizationUsers', () => {
    it('should return paginated organization users', async () => {
      const result = await controller.getOrganizationUsers();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const result = await controller.getOrganizationUsers('1', '10');

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should return users with all required fields', async () => {
      const result = await controller.getOrganizationUsers();

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
      const userData = {
        name: 'New User',
        email: 'newuser@albaly.com',
        role: 'member',
      };

      const result = await controller.createOrganizationUser(userData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
    });

    it('should assign default permissions based on role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@albaly.com',
        role: 'member',
      };

      const result = await controller.createOrganizationUser(userData);

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

      const result = await controller.updateOrganizationUser('1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe(updateData.name);
    });
  });

  describe('deleteOrganizationUser', () => {
    it('should delete organization user', async () => {
      const result = await controller.deleteOrganizationUser('1');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('getOrganizationPolicies', () => {
    it('should return organization policies', async () => {
      const result = await controller.getOrganizationPolicies();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dataRetention');
      expect(result).toHaveProperty('accessControl');
      expect(result).toHaveProperty('dataSharing');
      expect(result).toHaveProperty('apiAccess');
    });

    it('should return policies with configuration', async () => {
      const result = await controller.getOrganizationPolicies();

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

      const result = await controller.updateOrganizationPolicies(policiesData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('updated successfully');
    });
  });

  describe('getIntegrationSettings', () => {
    it('should return integration settings', async () => {
      const result = await controller.getIntegrationSettings();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('databases');
      expect(result).toHaveProperty('apis');
      expect(result).toHaveProperty('exports');
    });

    it('should return database connections', async () => {
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

      const result = await controller.updateIntegrationSettings(settingsData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('updated successfully');
    });
  });
});
