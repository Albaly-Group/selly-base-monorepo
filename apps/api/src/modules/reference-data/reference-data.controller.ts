import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReferenceDataService } from './reference-data.service';

@ApiTags('reference-data')
@Controller('reference-data')
export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  @Get('industries')
  @ApiOperation({ summary: 'Get all industries' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Industries retrieved successfully',
  })
  async getIndustries(
    @Query('active') active?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const industries = await this.referenceDataService.getIndustries(isActive);
    return { data: industries };
  }

  @Get('provinces')
  @ApiOperation({ summary: 'Get all provinces' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiQuery({
    name: 'countryCode',
    required: false,
    description: 'Filter by country code (default: TH)',
  })
  @ApiResponse({ status: 200, description: 'Provinces retrieved successfully' })
  async getProvinces(
    @Query('active') active?: string,
    @Query('countryCode') countryCode?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const provinces = await this.referenceDataService.getProvinces(
      isActive,
      countryCode || 'TH',
    );
    return { data: provinces };
  }

  @Get('company-sizes')
  @ApiOperation({ summary: 'Get all company sizes' })
  @ApiResponse({
    status: 200,
    description: 'Company sizes retrieved successfully',
  })
  async getCompanySizes(): Promise<{ data: any[] }> {
    const sizes = await this.referenceDataService.getCompanySizes();
    return { data: sizes };
  }

  @Get('contact-statuses')
  @ApiOperation({ summary: 'Get all contact statuses' })
  @ApiResponse({
    status: 200,
    description: 'Contact statuses retrieved successfully',
  })
  async getContactStatuses(): Promise<{ data: any[] }> {
    const statuses = await this.referenceDataService.getContactStatuses();
    return { data: statuses };
  }
}
