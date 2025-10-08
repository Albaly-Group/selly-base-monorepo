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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CompanyActivitiesService } from './company-activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentOrganization,
} from '../auth/current-user.decorator';
import {
  CreateCompanyActivityDto,
  UpdateCompanyActivityDto,
} from '../../dtos/company-activity.dto';

@ApiTags('company-activities')
@Controller('company-activities')
export class CompanyActivitiesController {
  constructor(
    private readonly companyActivitiesService: CompanyActivitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get activities with optional company filter' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filter by company ID',
  })
  @ApiQuery({
    name: 'activityType',
    required: false,
    description: 'Filter by activity type',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  async getActivities(
    @Query('companyId') companyId?: string,
    @Query('activityType') activityType?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: any[] }> {
    const activities = await this.companyActivitiesService.getActivities(
      companyId,
      activityType,
      limit ? parseInt(limit, 10) : undefined,
    );
    return { data: activities };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async getActivityById(@Param('id') id: string): Promise<any> {
    return this.companyActivitiesService.getActivityById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Log a new company activity' })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createActivity(
    @Body(new ValidationPipe()) createDto: CreateCompanyActivityDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ): Promise<any> {
    console.log('CreateDto', createDto);
    console.log('User', user);
    console.log('OrganizationId', organizationId);

    return this.companyActivitiesService.createActivity(
      createDto,
      user.sub,
      organizationId,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a company activity' })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateActivity(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateDto: UpdateCompanyActivityDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.companyActivitiesService.updateActivity(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a company activity' })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteActivity(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.companyActivitiesService.deleteActivity(id, user);
  }
}
