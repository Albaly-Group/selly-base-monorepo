import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import type { SearchFilters } from './companies.service';
import { Company } from '../../database/entities/company.entity';

@ApiTags('companies')
@Controller('api/v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search companies with multi-tenant filtering' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Organization ID for scoping' })
  @ApiQuery({ name: 'includeSharedData', required: false, type: Boolean, description: 'Include shared Albaly data' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async searchCompanies(@Query() query: SearchFilters) {
    try {
      return await this.companiesService.searchCompanies(query);
    } catch (error) {
      throw new HttpException(
        `Failed to search companies: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string
  ): Promise<Company> {
    try {
      const company = await this.companiesService.findById(id, organizationId);
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get company: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid company data' })
  async createCompany(
    @Body() companyData: Partial<Company> & { organizationId: string; createdBy: string }
  ): Promise<Company> {
    try {
      const { organizationId, createdBy, ...data } = companyData;
      return await this.companiesService.createCompany(data, organizationId, createdBy);
    } catch (error) {
      throw new HttpException(
        `Failed to create company: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Cannot update shared company data' })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateData: Partial<Company> & { organizationId: string; updatedBy: string }
  ): Promise<Company> {
    try {
      const { organizationId, updatedBy, ...data } = updateData;
      const company = await this.companiesService.updateCompany(id, data, organizationId, updatedBy);
      
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      
      return company;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message.includes('Cannot update shared')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException(
        `Failed to update company: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found or cannot be deleted' })
  async deleteCompany(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.companiesService.deleteCompany(id, organizationId);
      
      if (!success) {
        throw new HttpException(
          'Company not found or cannot be deleted (shared data)', 
          HttpStatus.NOT_FOUND
        );
      }
      
      return { success: true, message: 'Company deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to delete company: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}