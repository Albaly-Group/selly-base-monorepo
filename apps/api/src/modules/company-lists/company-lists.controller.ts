import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CompanyListsService } from './company-lists.service';
import { Users, Users as User } from '../../entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentOrganization,
} from '../auth/current-user.decorator';
import {
  CreateCompanyListDto,
  UpdateCompanyListDto,
  AddCompaniesToListDto,
  RemoveCompaniesFromListDto,
} from '../../dtos/company-list.dto';

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
  companyLists: [],
  userRoles2: [],
} as unknown as User);

interface CompanyListSearchQuery {
  searchTerm?: string;
  organizationId?: string;
  visibility?: string;
  page?: string;
  limit?: string;
  scope?: string;
}

@ApiTags('company-lists')
@Controller('company-lists')
export class CompanyListsController {
  constructor(private readonly companyListsService: CompanyListsService) {}

  @Get()
  @ApiOperation({ summary: 'Get company lists with filters' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'Search term for list name or description',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID to filter by',
  })
  @ApiQuery({
    name: 'visibility',
    required: false,
    description: 'Filter by visibility (private, team, organization, public)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 50)',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    description: 'Scope filter (mine, organization, public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Company lists retrieved successfully',
  })
  async getCompanyLists(
    @Query() query: CompanyListSearchQuery,
  ): Promise<PaginatedResponse<any>> {
    const searchParams = {
      searchTerm: query.searchTerm,
      organizationId: query.organizationId,
      visibility: query.visibility,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      scope: query.scope || 'organization',
    };

    // For public lists, allow without authentication
    const mockUser = createMockUser(query.organizationId);
    return this.companyListsService.searchCompanyLists(searchParams, mockUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company list by ID' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID for access control',
  })
  @ApiResponse({
    status: 200,
    description: 'Company list retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  async getCompanyListById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    const mockUser = createMockUser(organizationId);
    return this.companyListsService.getCompanyListById(id, mockUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new company list' })
  @ApiResponse({
    status: 201,
    description: 'Company list created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createCompanyList(
    @Body() createListDto: CreateCompanyListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.createCompanyList(
      createListDto,
      userWithOrg,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update company list by ID' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiResponse({
    status: 200,
    description: 'Company list updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot update this list',
  })
  async updateCompanyList(
    @Param('id') id: string,
    @Body() updateListDto: UpdateCompanyListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.updateCompanyList(
      id,
      updateListDto,
      userWithOrg,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete company list by ID' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiResponse({
    status: 200,
    description: 'Company list deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot delete this list',
  })
  async deleteCompanyList(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    await this.companyListsService.deleteCompanyList(id, userWithOrg);
    return { message: 'Company list deleted successfully' };
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get items in a company list' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID for access control',
  })
  @ApiResponse({
    status: 200,
    description: 'List items retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  async getListItems(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    const mockUser = createMockUser(organizationId);
    return this.companyListsService.getListItems(id, mockUser);
  }

  @Post(':id/companies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add companies to a list' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiResponse({
    status: 200,
    description: 'Companies added to list successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot modify this list',
  })
  async addCompaniesToList(
    @Param('id') listId: string,
    @Body() body: AddCompaniesToListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.addCompaniesToList(
      listId,
      body.companyIds,
      userWithOrg,
    );
  }

  @Delete(':id/companies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove companies from a list' })
  @ApiParam({ name: 'id', description: 'Company list ID' })
  @ApiResponse({
    status: 200,
    description: 'Companies removed from list successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company list not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - cannot modify this list',
  })
  async removeCompaniesFromList(
    @Param('id') listId: string,
    @Body() body: RemoveCompaniesFromListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.removeCompaniesFromList(
      listId,
      body.companyIds,
      userWithOrg,
    );
  }
}
