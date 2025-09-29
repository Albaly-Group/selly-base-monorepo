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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { User } from '../../entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentOrganization } from '../auth/current-user.decorator';
import { CreateCompanyDto, UpdateCompanyDto } from '../../dtos/company.dto';

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

// For endpoints that don't require authentication, we create a mock user
const createMockUser = (organizationId?: string): User => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174001',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed',
  avatarUrl: null,
  status: 'active',
  lastLoginAt: null,
  emailVerifiedAt: new Date(),
  settings: {},
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  organization: {} as any,
  ownedLists: [],
  roles: [],
});

interface CompanySearchQuery {
  searchTerm?: string;
  organizationId?: string;
  includeSharedData?: string;
  page?: string;
  limit?: string;
  dataSensitivity?: string;
  dataSource?: string;
  verificationStatus?: string;
  companySize?: string;
  province?: string;
}

@ApiTags('companies')
@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search companies with filters' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term for company name or description' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Organization ID to filter by' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'includeSharedData', required: false, description: 'Include shared data (default: true)' })
  @ApiQuery({ name: 'dataSensitivity', required: false, description: 'Filter by data sensitivity' })
  @ApiQuery({ name: 'dataSource', required: false, description: 'Filter by data source' })
  @ApiQuery({ name: 'verificationStatus', required: false, description: 'Filter by verification status' })
  @ApiQuery({ name: 'companySize', required: false, description: 'Filter by company size' })
  @ApiQuery({ name: 'province', required: false, description: 'Filter by province' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async searchCompanies(@Query() query: CompanySearchQuery): Promise<PaginatedResponse<any>> {
    const searchParams = {
      searchTerm: query.searchTerm,
      organizationId: query.organizationId,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      includeSharedData: query.includeSharedData !== 'false',
      dataSensitivity: query.dataSensitivity,
      dataSource: query.dataSource,
      verificationStatus: query.verificationStatus,
      companySize: query.companySize,
      province: query.province,
    };

    // For public search, use mock user with provided organizationId
    const mockUser = createMockUser(query.organizationId);
    return this.companiesService.searchCompanies(searchParams, mockUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get companies (legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async getCompanies(@Query() query: CompanySearchQuery): Promise<PaginatedResponse<any>> {
    // Legacy endpoint that uses search underneath
    return this.searchCompanies(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Organization ID for access control' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.companiesService.getCompanyById(id, organizationId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companiesService.createCompany(createCompanyDto, userWithOrg);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update this company' })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companiesService.updateCompany(id, updateCompanyDto, userWithOrg);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot delete this company' })
  async deleteCompany(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    await this.companiesService.deleteCompany(id, userWithOrg);
    return { message: 'Company deleted successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Get multiple companies by IDs' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async getCompaniesByIds(
    @Body('ids') ids: string[],
    @Query('organizationId') organizationId?: string,
  ) {
    return this.companiesService.getCompaniesByIds(ids, organizationId);
  }
}