import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlatformAdminService } from './platform-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('platform-admin')
@Controller('platform-admin')
@UseGuards(JwtAuthGuard)
export class PlatformAdminController {
  constructor(
    private readonly platformAdminService: PlatformAdminService,
  ) {}

  /**
   * Check if user has platform admin permissions
   * Platform admins should have the 'platform_admin' role or '*' permission
   */
  private checkPlatformAdminPermission(user: any) {
    // Check if user has platform_admin role
    const roles = user.roles || [];
    const isPlatformAdmin = roles.some(
      (role: any) =>
        role.name === 'platform_admin' || role.name === 'Platform Admin',
    );

    // Check if user has wildcard permission
    const permissions = user.permissions || [];
    const hasWildcard = permissions.some((perm: any) => perm.key === '*');

    // Check if user has specific platform admin permissions
    const hasPlatformPermission = permissions.some((perm: any) =>
      perm.key?.startsWith('platform:') || perm.key?.startsWith('tenants:'),
    );

    if (!isPlatformAdmin && !hasWildcard && !hasPlatformPermission) {
      throw new ForbiddenException(
        'Access denied. Platform admin privileges required.',
      );
    }
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Get all tenant organizations (Platform Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant organizations retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTenants(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Check platform admin permissions
    this.checkPlatformAdminPermission(req.user);

    return this.platformAdminService.getTenants(
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all platform users (Platform Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPlatformUsers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Check platform admin permissions
    this.checkPlatformAdminPermission(req.user);

    return this.platformAdminService.getPlatformUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }

  @Get('shared-companies')
  @ApiOperation({ summary: 'Get shared companies (Platform Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Shared companies retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSharedCompanies(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Check platform admin permissions
    this.checkPlatformAdminPermission(req.user);

    return this.platformAdminService.getSharedCompanies(
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }
}
