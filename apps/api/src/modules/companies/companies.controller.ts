import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { Users, Users as User } from '../../entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentOrganization,
} from '../auth/current-user.decorator';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanySearchDto,
  BulkCompanyIdsDto,
} from '../../dtos/enhanced-company.dto';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search companies with advanced filters' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Search term for company name or description',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID for scoped search',
  })
  @ApiQuery({
    name: 'includeSharedData',
    required: false,
    type: Boolean,
    description: 'Include shared data in results',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'dataSensitivity',
    required: false,
    description: 'Filter by data sensitivity',
  })
  @ApiQuery({
    name: 'dataSource',
    required: false,
    description: 'Filter by data source',
  })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    description: 'Filter by verification status',
  })
  @ApiQuery({
    name: 'companySize',
    required: false,
    description: 'Filter by company size',
  })
  @ApiQuery({
    name: 'province',
    required: false,
    description: 'Filter by province',
  })
  @ApiQuery({
    name: 'countryCode',
    required: false,
    description: 'Filter by country code',
  })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }),
  )
  async searchCompanies(
    @Query() searchDto: CompanySearchDto,
  ): Promise<PaginatedResponse<any>> {
    return this.companiesService.searchCompanies(searchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get companies (legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async getCompanies(
    @Query('organizationId') organizationId?: string,
    @Query('includeSharedData') includeSharedData?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<any>> {
    // Simple parameter handling without complex validation for now
    const searchDto = {
      organizationId,
      includeSharedData: includeSharedData === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    return this.companiesService.searchCompanies(searchDto as any, undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID for access control',
  })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.companiesService.getCompanyById(id, organizationId, undefined);
  }
}
