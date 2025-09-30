import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StaffService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get staff members' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  async getStaffMembers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.staffService.getStaffMembers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      organizationId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create staff member' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  async createStaffMember(@Body() staffData: {
    name: string;
    email: string;
    password?: string;
    organizationId?: string;
    role?: string;
  }) {
    return this.staffService.createStaffMember(staffData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  async updateStaffMember(
    @Param('id') id: string,
    @Body() updateData: any,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.staffService.updateStaffMember(id, updateData, organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deleted successfully' })
  async deleteStaffMember(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.staffService.deleteStaffMember(id, organizationId);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update staff member role' })
  @ApiResponse({ status: 200, description: 'Staff member role updated successfully' })
  async updateStaffRole(
    @Param('id') id: string,
    @Body() roleData: { role: string },
    @Query('organizationId') organizationId?: string,
  ) {
    return this.staffService.updateStaffRole(id, roleData.role, organizationId);
  }
}