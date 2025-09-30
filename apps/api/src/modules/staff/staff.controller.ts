import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  @Get()
  @ApiOperation({ summary: 'Get staff members' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  async getStaffMembers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Mock implementation
    return {
      data: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@albaly.com',
          role: 'admin',
          department: 'Engineering',
          status: 'active',
          lastLogin: '2024-12-08T09:30:00Z',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@albaly.com',
          role: 'manager',
          department: 'Sales',
          status: 'active',
          lastLogin: '2024-12-08T14:15:00Z',
          createdAt: '2024-02-20T11:30:00Z'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@albaly.com',
          role: 'user',
          department: 'Marketing',
          status: 'inactive',
          lastLogin: '2024-12-05T16:45:00Z',
          createdAt: '2024-03-10T09:00:00Z'
        }
      ],
      pagination: {
        page: parseInt(page || '1', 10),
        limit: parseInt(limit || '50', 10),
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create staff member' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  async createStaffMember(@Body() staffData: any) {
    // Mock implementation
    return {
      id: Date.now().toString(),
      name: staffData.name,
      email: staffData.email,
      role: staffData.role || 'user',
      department: staffData.department,
      status: 'active',
      createdAt: new Date().toISOString(),
      message: 'Staff member created successfully'
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  async updateStaffMember(@Param('id') id: string, @Body() updateData: any) {
    // Mock implementation
    return {
      id,
      ...updateData,
      updatedAt: new Date().toISOString(),
      message: 'Staff member updated successfully'
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deleted successfully' })
  async deleteStaffMember(@Param('id') id: string) {
    return { message: `Staff member ${id} deleted successfully` };
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update staff member role' })
  @ApiResponse({ status: 200, description: 'Staff member role updated successfully' })
  async updateStaffRole(@Param('id') id: string, @Body() body: { role: string }) {
    // Mock implementation
    return {
      id,
      role: body.role,
      updatedAt: new Date().toISOString(),
      message: `Staff member role updated to ${body.role}`
    };
  }
}