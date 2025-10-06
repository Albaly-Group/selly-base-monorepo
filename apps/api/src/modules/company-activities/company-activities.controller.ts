import {
  Controller,
  Get,
  Post,
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
import { CurrentUser, CurrentOrganization } from '../auth/current-user.decorator';
import { CreateCompanyActivityDto } from '../../dtos/company-activity.dto';

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
    return this.companyActivitiesService.createActivity(
      createDto,
      user.id,
      organizationId,
    );
  }
}
