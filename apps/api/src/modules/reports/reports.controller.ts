import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics retrieved successfully',
  })
  async getDashboardAnalytics(@Query('organizationId') organizationId?: string) {
    return this.reportsService.getDashboardAnalytics(organizationId);
  }

  @Get('data-quality')
  @ApiOperation({ summary: 'Get data quality metrics' })
  @ApiResponse({
    status: 200,
    description: 'Data quality metrics retrieved successfully',
  })
  async getDataQualityMetrics(@Query('organizationId') organizationId?: string) {
    return this.reportsService.getDataQualityMetrics(organizationId);
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity reports' })
  @ApiResponse({
    status: 200,
    description: 'User activity reports retrieved successfully',
  })
  async getUserActivityReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getUserActivityReports(startDate, endDate, organizationId);
  }

  @Get('export-history')
  @ApiOperation({ summary: 'Get export history reports' })
  @ApiResponse({
    status: 200,
    description: 'Export history reports retrieved successfully',
  })
  async getExportHistoryReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getExportHistoryReports(startDate, endDate, organizationId);
  }
}
