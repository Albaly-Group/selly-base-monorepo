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
import { User } from '../../entities';
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
    // For public search, use mock user with provided organizationId
    const mockUser = createMockUser(searchDto.organizationId);
    return this.companiesService.searchCompanies(searchDto, mockUser);
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

    const mockUser = createMockUser(organizationId);
    return this.companiesService.searchCompanies(searchDto as any, mockUser);
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
    const mockUser = createMockUser(organizationId);
    return this.companiesService.getCompanyById(id, organizationId, mockUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot update this company',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companiesService.updateCompany(
      id,
      updateCompanyDto,
      userWithOrg,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot delete this company',
  })
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
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getCompaniesByIds(@Body() bulkDto: BulkCompanyIdsDto) {
    // For public bulk access, use mock user
    const mockUser = createMockUser(bulkDto.organizationId);
    return this.companiesService.getCompaniesByIds(bulkDto, mockUser);
  }
}
