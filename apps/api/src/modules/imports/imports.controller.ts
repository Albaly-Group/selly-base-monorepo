import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportsService } from './imports.service';
import { TemplateService } from './template.service';
import {
  ImportEntityType,
  UploadImportFileDto,
  ExecuteImportDto,
  PreviewImportDto,
} from '../../dtos/import.dto';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
    private readonly templateService: TemplateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get import jobs' })
  @ApiResponse({
    status: 200,
    description: 'Import jobs retrieved successfully',
  })
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
  async createImportJob(
    @Body()
    importData: {
      filename: string;
      organizationId?: string;
      uploadedBy?: string;
    },
  ) {
    return this.importsService.createImportJob(importData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Import job retrieved successfully',
  })
  async getImportJobById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.importsService.getImportJobById(id, organizationId);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate import data' })
  @ApiResponse({
    status: 200,
    description: 'Import data validated successfully',
  })
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
    @Body() executeDto?: ExecuteImportDto,
  ) {
    return this.importsService.executeImportJob(id, organizationId, {
      rowIndices: executeDto?.rowIndices,
      skipErrors: executeDto?.skipErrors,
    });
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file for import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          enum: Object.values(ImportEntityType),
        },
        organizationId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['file', 'entityType'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImportFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname
      .substring(file.originalname.lastIndexOf('.'))
      .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Invalid file type. Only CSV and XLSX files are supported.',
      );
    }

    // Create import job with file data
    const importJob = await this.importsService.createImportJob(
      {
        filename: file.originalname,
        organizationId: uploadDto.organizationId,
        entityType: uploadDto.entityType,
      },
      file.buffer,
    );

    return {
      id: importJob.id,
      filename: importJob.filename,
      status: importJob.status,
      totalRecords: importJob.totalRecords,
      message: 'File uploaded successfully. You can now validate and preview the data.',
    };
  }

  @Get('templates/:entityType/csv')
  @ApiOperation({ summary: 'Download CSV import template' })
  @ApiResponse({ status: 200, description: 'CSV template downloaded' })
  async downloadCSVTemplate(
    @Param('entityType') entityType: ImportEntityType,
    @Res() res: Response,
  ) {
    const csv = this.templateService.generateCSVTemplate(entityType);
    const filename = this.templateService.getTemplateFilename(entityType, 'csv');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('templates/:entityType/xlsx')
  @ApiOperation({ summary: 'Download XLSX import template' })
  @ApiResponse({ status: 200, description: 'XLSX template downloaded' })
  async downloadXLSXTemplate(
    @Param('entityType') entityType: ImportEntityType,
    @Res() res: Response,
  ) {
    const buffer = this.templateService.generateXLSXTemplate(entityType);
    const filename = this.templateService.getTemplateFilename(entityType, 'xlsx');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview import data with validation' })
  @ApiResponse({ status: 200, description: 'Import preview retrieved successfully' })
  async getImportPreview(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.importsService.getImportPreview(id, organizationId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
