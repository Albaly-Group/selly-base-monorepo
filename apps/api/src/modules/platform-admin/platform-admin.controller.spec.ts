import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { ForbiddenException } from '@nestjs/common';

describe('PlatformAdminController', () => {
  let controller: PlatformAdminController;
  let service: PlatformAdminService;

  const mockPlatformAdminService = {
    updateTenant: jest.fn(),
    updatePlatformUser: jest.fn(),
    updateSharedCompany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformAdminController],
      providers: [
        {
          provide: PlatformAdminService,
          useValue: mockPlatformAdminService,
        },
      ],
    }).compile();

    controller = module.get<PlatformAdminController>(PlatformAdminController);
    service = module.get<PlatformAdminService>(PlatformAdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations - Update Routes', () => {
    const mockUser = {
      id: 'user-123',
      permissions: [{ key: '*' }], // Wildcard permission for testing
    };

    const mockRequest = { user: mockUser };
    const testId = 'test-id-123';

    describe('Tenant Update Routes', () => {
      const updateDto = { name: 'Updated Tenant' };

      it('should have separate patchTenant method for PATCH requests', async () => {
        expect(controller.patchTenant).toBeDefined();
        expect(typeof controller.patchTenant).toBe('function');
      });

      it('should have separate updateTenant method for PUT requests', async () => {
        expect(controller.updateTenant).toBeDefined();
        expect(typeof controller.updateTenant).toBe('function');
      });

      it('should call service.updateTenant when patchTenant is called', async () => {
        mockPlatformAdminService.updateTenant.mockResolvedValue({
          message: 'Tenant updated successfully',
        });

        await controller.patchTenant(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updateTenant).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });

      it('should call service.updateTenant when updateTenant is called', async () => {
        mockPlatformAdminService.updateTenant.mockResolvedValue({
          message: 'Tenant updated successfully',
        });

        await controller.updateTenant(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updateTenant).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });

      it('should throw ForbiddenException if user lacks permissions', async () => {
        const unauthorizedRequest = { user: { permissions: [] } };

        await expect(
          controller.patchTenant(unauthorizedRequest, testId, updateDto),
        ).rejects.toThrow(ForbiddenException);

        await expect(
          controller.updateTenant(unauthorizedRequest, testId, updateDto),
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('User Update Routes', () => {
      const updateDto = { name: 'Updated User' };

      it('should have separate patchPlatformUser method for PATCH requests', async () => {
        expect(controller.patchPlatformUser).toBeDefined();
        expect(typeof controller.patchPlatformUser).toBe('function');
      });

      it('should have separate updatePlatformUser method for PUT requests', async () => {
        expect(controller.updatePlatformUser).toBeDefined();
        expect(typeof controller.updatePlatformUser).toBe('function');
      });

      it('should call service.updatePlatformUser when patchPlatformUser is called', async () => {
        mockPlatformAdminService.updatePlatformUser.mockResolvedValue({
          message: 'User updated successfully',
        });

        await controller.patchPlatformUser(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updatePlatformUser).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });

      it('should call service.updatePlatformUser when updatePlatformUser is called', async () => {
        mockPlatformAdminService.updatePlatformUser.mockResolvedValue({
          message: 'User updated successfully',
        });

        await controller.updatePlatformUser(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updatePlatformUser).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });
    });

    describe('Shared Company Update Routes', () => {
      const updateDto = { companyNameEn: 'Updated Company' };

      it('should have separate patchSharedCompany method for PATCH requests', async () => {
        expect(controller.patchSharedCompany).toBeDefined();
        expect(typeof controller.patchSharedCompany).toBe('function');
      });

      it('should have separate updateSharedCompany method for PUT requests', async () => {
        expect(controller.updateSharedCompany).toBeDefined();
        expect(typeof controller.updateSharedCompany).toBe('function');
      });

      it('should call service.updateSharedCompany when patchSharedCompany is called', async () => {
        mockPlatformAdminService.updateSharedCompany.mockResolvedValue({
          message: 'Company updated successfully',
        });

        await controller.patchSharedCompany(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updateSharedCompany).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });

      it('should call service.updateSharedCompany when updateSharedCompany is called', async () => {
        mockPlatformAdminService.updateSharedCompany.mockResolvedValue({
          message: 'Company updated successfully',
        });

        await controller.updateSharedCompany(mockRequest, testId, updateDto);

        expect(mockPlatformAdminService.updateSharedCompany).toHaveBeenCalledWith(
          testId,
          updateDto,
        );
      });
    });
  });

  describe('Permission Checks', () => {
    it('should allow access with wildcard permission', () => {
      const user = { permissions: [{ key: '*' }] };
      const req = { user };

      // Should not throw
      expect(() =>
        controller['checkPlatformAdminPermission'](user, 'tenants:manage'),
      ).not.toThrow();
    });

    it('should allow access with exact permission match', () => {
      const user = { permissions: [{ key: 'tenants:manage' }] };
      const req = { user };

      // Should not throw
      expect(() =>
        controller['checkPlatformAdminPermission'](user, 'tenants:manage'),
      ).not.toThrow();
    });

    it('should allow access with wildcard category permission', () => {
      const user = { permissions: [{ key: 'tenants:*' }] };
      const req = { user };

      // Should not throw
      expect(() =>
        controller['checkPlatformAdminPermission'](user, 'tenants:manage'),
      ).not.toThrow();
    });

    it('should deny access without proper permissions', () => {
      const user = { permissions: [{ key: 'users:manage' }] };
      const req = { user };

      // Should throw ForbiddenException
      expect(() =>
        controller['checkPlatformAdminPermission'](user, 'tenants:manage'),
      ).toThrow(ForbiddenException);
    });

    it('should deny access with empty permissions', () => {
      const user = { permissions: [] };
      const req = { user };

      // Should throw ForbiddenException
      expect(() =>
        controller['checkPlatformAdminPermission'](user, 'tenants:manage'),
      ).toThrow(ForbiddenException);
    });
  });
});
