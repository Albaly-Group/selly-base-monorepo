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
  HttpCode,
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
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
    return this.companyListsService.getCompanyListById(id, undefined);
  }

  async getCompanyLists(
    @Query() query: CompanyListSearchQuery,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ): Promise<PaginatedResponse<any>> {
    const searchParams = {
      searchTerm: query.searchTerm,
      organizationId: query.organizationId || organizationId,
      visibility: query.visibility,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      scope: query.scope || 'organization',
    };

    let userWithOrg: Users | undefined = undefined;
    if (user) {
      userWithOrg = {
        id: user.sub,
        email: user.email,
        organizationId: organizationId,
        name: user.name || 'User',
        passwordHash: '',
        avatarUrl: null,
        status: 'active',
        lastLoginAt: null,
        emailVerifiedAt: new Date(),
        settings: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: {} as any,
        auditLogs: [],
        companyListItems: [],
        companyLists: [],
        exportJobs: [],
        importJobs: [],
        leadProjectCompanies: [],
        leadProjectCompanies2: [],
        leadProjectTasks: [],
        leadProjects: [],
        leadProjects2: [],
        leadProjects3: [],
        userActivityLogs: [],
        userRoles: [],
        userRoles2: [],
      };
    }

    // สำหรับ public lists ให้ไม่ต้องส่ง user
    if (searchParams.scope === 'public') {
      return this.companyListsService.searchCompanyLists(
        searchParams,
        undefined,
      );
    }
    return this.companyListsService.searchCompanyLists(
      searchParams,
      userWithOrg,
    );
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
    const userWithOrg: Users = {
      id: user.sub,
      email: user.email,
      organizationId: organizationId,
      name: user.name || 'User',
      passwordHash: '',
      avatarUrl: null,
      status: 'active',
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      settings: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {} as any,
      auditLogs: [],
      companyListItems: [],
      companyLists: [],
      exportJobs: [],
      importJobs: [],
      leadProjectCompanies: [],
      leadProjectCompanies2: [],
      leadProjectTasks: [],
      leadProjects: [],
      leadProjects2: [],
      leadProjects3: [],
      userActivityLogs: [],
      userRoles: [],
      userRoles2: [],
    };

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
    const userWithOrg: Users = {
      id: user.sub,
      email: user.email,
      organizationId: organizationId,
      name: user.name || 'User',
      passwordHash: '',
      avatarUrl: null,
      status: 'active',
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      settings: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {} as any,
      auditLogs: [],
      companyListItems: [],
      companyLists: [],
      exportJobs: [],
      importJobs: [],
      leadProjectCompanies: [],
      leadProjectCompanies2: [],
      leadProjectTasks: [],
      leadProjects: [],
      leadProjects2: [],
      leadProjects3: [],
      userActivityLogs: [],
      userRoles: [],
      userRoles2: [],
    };
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
    const userWithOrg: Users = {
      id: user.sub,
      email: user.email,
      organizationId: organizationId,
      name: user.name || 'User',
      passwordHash: '',
      avatarUrl: null,
      status: 'active',
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      settings: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {} as any,
      auditLogs: [],
      companyListItems: [],
      companyLists: [],
      exportJobs: [],
      importJobs: [],
      leadProjectCompanies: [],
      leadProjectCompanies2: [],
      leadProjectTasks: [],
      leadProjects: [],
      leadProjects2: [],
      leadProjects3: [],
      userActivityLogs: [],
      userRoles: [],
      userRoles2: [],
    };
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
    const items = await this.companyListsService.getListItems(id, undefined);
    return { data: items };
  }

  @Post(':id/companies')
  @HttpCode(200)
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
    // Create a proper user object from JWT payload
    const userWithOrg: Users = {
      id: user.sub,
      email: user.email,
      organizationId: organizationId,
      name: user.name || 'User',
      passwordHash: '',
      avatarUrl: null,
      status: 'active',
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      settings: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {} as any,
      auditLogs: [],
      companyListItems: [],
      companyLists: [],
      exportJobs: [],
      importJobs: [],
      leadProjectCompanies: [],
      leadProjectCompanies2: [],
      leadProjectTasks: [],
      leadProjects: [],
      leadProjects2: [],
      leadProjects3: [],
      userActivityLogs: [],
      userRoles: [],
      userRoles2: [],
    };

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
    const userWithOrg: Users = {
      id: user.sub,
      email: user.email,
      organizationId: organizationId,
      name: user.name || 'User',
      passwordHash: '',
      avatarUrl: null,
      status: 'active',
      lastLoginAt: null,
      emailVerifiedAt: new Date(),
      settings: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {} as any,
      auditLogs: [],
      companyListItems: [],
      companyLists: [],
      exportJobs: [],
      importJobs: [],
      leadProjectCompanies: [],
      leadProjectCompanies2: [],
      leadProjectTasks: [],
      leadProjects: [],
      leadProjects2: [],
      leadProjects3: [],
      userActivityLogs: [],
      userRoles: [],
      userRoles2: [],
    };

    return this.companyListsService.removeCompaniesFromList(
      listId,
      body.companyIds,
      userWithOrg,
    );
  }
}
