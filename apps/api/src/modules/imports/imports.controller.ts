import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get import jobs' })
  @ApiResponse({ status: 200, description: 'Import jobs retrieved successfully' })
  async getImportJobs(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.importsService.getImportJobs({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      organizationId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create import job' })
  @ApiResponse({ status: 201, description: 'Import job created successfully' })
  async createImportJob(@Body() importData: {
    filename: string;
    organizationId?: string;
    uploadedBy?: string;
  }) {
    return this.importsService.createImportJob(importData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import job by ID' })
  @ApiResponse({ status: 200, description: 'Import job retrieved successfully' })
  async getImportJobById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.importsService.getImportJobById(id, organizationId);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate import data' })
  @ApiResponse({ status: 200, description: 'Import data validated successfully' })
  async validateImportData(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.importsService.validateImportData(id, organizationId);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute import job' })
  @ApiResponse({ status: 200, description: 'Import job execution started' })
  async executeImportJob(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.importsService.executeImportJob(id, organizationId);
  }
}