import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PlatformAdminService } from './platform-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreatePlatformUserDto,
  UpdatePlatformUserDto,
  UpdateSharedCompanyDto,
} from '../../dtos/platform-admin.dto';

@ApiTags('platform-admin')
@Controller('platform-admin')
@UseGuards(JwtAuthGuard)
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

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
  @ApiOperation({
    summary: 'Get all tenant organizations (Platform Admin only)',
  })
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

  // ===== CREATE OPERATIONS =====

  @Post('tenants')
  @ApiOperation({
    summary: 'Create a new tenant organization (Platform Admin only)',
  })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Organization with slug already exists',
  })
  @ApiBody({ type: CreateTenantDto })
  async createTenant(
    @Request() req: any,
    @Body() createTenantDto: CreateTenantDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'tenants:manage');
    return this.platformAdminService.createTenant(createTenantDto);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new platform user (Platform Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  @ApiBody({ type: CreatePlatformUserDto })
  async createPlatformUser(
    @Request() req: any,
    @Body() createUserDto: CreatePlatformUserDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'users:manage');
    return this.platformAdminService.createPlatformUser(createUserDto);
  }

  // ===== UPDATE OPERATIONS =====

  // PATCH endpoint for partial updates
  @Patch('tenants/:id')
  @ApiOperation({
    summary: 'Update a tenant organization (Platform Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: 'string' })
  @ApiBody({ type: UpdateTenantDto })
  async patchTenant(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'tenants:manage');
    return this.platformAdminService.updateTenant(id, updateTenantDto);
  }

  // PUT endpoint for full updates
  @Put('tenants/:id')
  @ApiOperation({
    summary: 'Update a tenant organization (Platform Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: 'string' })
  @ApiBody({ type: UpdateTenantDto })
  async updateTenant(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'tenants:manage');
    return this.platformAdminService.updateTenant(id, updateTenantDto);
  }

  // PATCH endpoint for partial user updates
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a platform user (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiBody({ type: UpdatePlatformUserDto })
  async patchPlatformUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdatePlatformUserDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'users:manage');
    return this.platformAdminService.updatePlatformUser(id, updateUserDto);
  }

  // PUT endpoint for full user updates
  @Put('users/:id')
  @ApiOperation({ summary: 'Update a platform user (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiBody({ type: UpdatePlatformUserDto })
  async updatePlatformUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdatePlatformUserDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'users:manage');
    return this.platformAdminService.updatePlatformUser(id, updateUserDto);
  }

  // PATCH endpoint for partial shared company updates
  @Patch('shared-companies/:id')
  @ApiOperation({ summary: 'Update a shared company (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID', type: 'string' })
  @ApiBody({ type: UpdateSharedCompanyDto })
  async patchSharedCompany(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateSharedCompanyDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'shared-data:manage');
    return this.platformAdminService.updateSharedCompany(id, updateCompanyDto);
  }

  // PUT endpoint for full shared company updates
  @Put('shared-companies/:id')
  @ApiOperation({ summary: 'Update a shared company (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID', type: 'string' })
  @ApiBody({ type: UpdateSharedCompanyDto })
  async updateSharedCompany(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateSharedCompanyDto,
  ) {
    this.checkPlatformAdminPermission(req.user, 'shared-data:manage');
    return this.platformAdminService.updateSharedCompany(id, updateCompanyDto);
  }

  // ===== DELETE OPERATIONS =====

  @Delete('tenants/:id')
  @ApiOperation({
    summary: 'Delete a tenant organization (Platform Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Tenant deactivated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'id', description: 'Tenant ID', type: 'string' })
  async deleteTenant(@Request() req: any, @Param('id') id: string) {
    this.checkPlatformAdminPermission(req.user, 'tenants:manage');
    return this.platformAdminService.deleteTenant(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a platform user (Platform Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Platform admin privileges required.',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  async deletePlatformUser(@Request() req: any, @Param('id') id: string) {
    this.checkPlatformAdminPermission(req.user, 'users:manage');
    return this.platformAdminService.deletePlatformUser(id);
  }
}
