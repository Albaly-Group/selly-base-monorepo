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
   * Uses consistent RBAC permission checks: tenants:*, users:*, analytics:*, etc.
   */
  private checkPlatformAdminPermission(user: any, requiredPermission: string) {
    const permissions = user.permissions || [];
    
    // Check for wildcard permission (full platform admin access)
    const hasWildcard = permissions.some((perm: any) => perm.key === '*');
    if (hasWildcard) return;

    // Check for exact permission match
    const hasExactPermission = permissions.some(
      (perm: any) => perm.key === requiredPermission,
    );
    if (hasExactPermission) return;

    // Check for wildcard category permission (e.g., 'tenants:*' matches 'tenants:manage')
    const hasWildcardCategory = permissions.some((perm: any) => {
      if (perm.key?.endsWith(':*')) {
        const prefix = perm.key.slice(0, -1); // Remove '*'
        return requiredPermission.startsWith(prefix);
      }
      return false;
    });
    if (hasWildcardCategory) return;

    // No matching permissions found
    throw new ForbiddenException(
      'Access denied. Platform admin privileges required.',
    );
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
    // Check platform admin permissions - requires 'tenants:manage' or wildcard
    this.checkPlatformAdminPermission(req.user, 'tenants:manage');

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
    // Check platform admin permissions - requires 'users:manage' or wildcard
    this.checkPlatformAdminPermission(req.user, 'users:manage');

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
    // Check platform admin permissions - requires 'shared-data:manage' or wildcard
    this.checkPlatformAdminPermission(req.user, 'shared-data:manage');

    return this.platformAdminService.getSharedCompanies(
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }
}
