import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get organization users' })
  @ApiResponse({
    status: 200,
    description: 'Organization users retrieved successfully',
  })
  async getOrganizationUsers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Get organizationId from authenticated user
    const organizationId = req.user?.organizationId;
    return this.adminService.getOrganizationUsers(
      organizationId,
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }

  @Post('users')
  @ApiOperation({ summary: 'Create organization user' })
  @ApiResponse({
    status: 201,
    description: 'Organization user created successfully',
  })
  async createOrganizationUser(@Request() req: any, @Body() userData: any) {
    const organizationId = req.user?.organizationId;
    return this.adminService.createOrganizationUser({
      ...userData,
      organizationId,
    });
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update organization user' })
  @ApiResponse({
    status: 200,
    description: 'Organization user updated successfully',
  })
  async updateOrganizationUser(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.adminService.updateOrganizationUser(id, updateData);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete organization user' })
  @ApiResponse({
    status: 200,
    description: 'Organization user deleted successfully',
  })
  async deleteOrganizationUser(@Param('id') id: string) {
    return this.adminService.deleteOrganizationUser(id);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get organization policies' })
  @ApiResponse({
    status: 200,
    description: 'Organization policies retrieved successfully',
  })
  async getOrganizationPolicies(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    return this.adminService.getOrganizationPolicies(organizationId);
  }

  @Put('policies')
  @ApiOperation({ summary: 'Update organization policies' })
  @ApiResponse({
    status: 200,
    description: 'Organization policies updated successfully',
  })
  async updateOrganizationPolicies(@Request() req: any, @Body() policies: any) {
    const organizationId = req.user?.organizationId;
    return this.adminService.updateOrganizationPolicies(organizationId, policies);
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Get integration settings' })
  @ApiResponse({
    status: 200,
    description: 'Integration settings retrieved successfully',
  })
  async getIntegrationSettings(@Request() req: any) {
    const organizationId = req.user?.organizationId;
    return this.adminService.getIntegrationSettings(organizationId);
  }

  @Put('integrations')
  @ApiOperation({ summary: 'Update integration settings' })
  @ApiResponse({
    status: 200,
    description: 'Integration settings updated successfully',
  })
  async updateIntegrationSettings(@Request() req: any, @Body() settings: any) {
    const organizationId = req.user?.organizationId;
    return this.adminService.updateIntegrationSettings(organizationId, settings);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs' })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
  })
  async getActivityLogs(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const organizationId = req.user?.organizationId;
    return this.adminService.getActivityLogs(
      organizationId,
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
      startDate,
      endDate,
    );
  }
}
