import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExportsService } from './exports.service';

@ApiTags('exports')
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get export jobs' })
  @ApiResponse({
    status: 200,
    description: 'Export jobs retrieved successfully',
  })
  async getExportJobs(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.exportsService.getExportJobs({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      organizationId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create export job' })
  @ApiResponse({ status: 201, description: 'Export job created successfully' })
  async createExportJob(
    @Body()
    exportData: {
      filename: string;
      scope?: string;
      format?: 'CSV' | 'Excel' | 'JSON';
      organizationId?: string;
      requestedBy?: string;
    },
  ) {
    return this.exportsService.createExportJob(exportData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Export job retrieved successfully',
  })
  async getExportJobById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.exportsService.getExportJobById(id, organizationId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download export file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Export file not found' })
  async downloadExportFile(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.exportsService.downloadExportFile(id, organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel export job' })
  @ApiResponse({
    status: 200,
    description: 'Export job cancelled successfully',
  })
  async cancelExportJob(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.exportsService.deleteExportJob(id, organizationId);
  }
}
