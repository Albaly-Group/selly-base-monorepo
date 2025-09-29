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
import { CompanyListsService } from './company-lists.service';
import { User } from '../../entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentOrganization } from '../auth/current-user.decorator';
import { 
  CreateCompanyListDto, 
  UpdateCompanyListDto, 
  AddCompaniesToListDto, 
  RemoveCompaniesFromListDto 
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
  ownedLists: [],
  roles: [],
});

interface CompanyListSearchQuery {
  searchTerm?: string;
  organizationId?: string;
  visibility?: string;
  page?: string;
  limit?: string;
  scope?: string;
}

@Controller('api/company-lists')
export class CompanyListsController {
  constructor(private readonly companyListsService: CompanyListsService) {}

  @Get()
  async getCompanyLists(@Query() query: CompanyListSearchQuery): Promise<PaginatedResponse<any>> {
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
  async getCompanyListById(@Param('id') id: string, @Query('organizationId') organizationId?: string) {
    const mockUser = createMockUser(organizationId);
    return this.companyListsService.getCompanyListById(id, mockUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCompanyList(
    @Body(new ValidationPipe({ transform: true })) createListDto: CreateCompanyListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.createCompanyList(createListDto, userWithOrg);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCompanyList(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateListDto: UpdateCompanyListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.updateCompanyList(id, updateListDto, userWithOrg);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
  async getListItems(@Param('id') id: string, @Query('organizationId') organizationId?: string) {
    const mockUser = createMockUser(organizationId);
    return this.companyListsService.getListItems(id, mockUser);
  }

  @Post(':id/companies')
  @UseGuards(JwtAuthGuard)
  async addCompaniesToList(
    @Param('id') listId: string,
    @Body(new ValidationPipe({ transform: true })) body: AddCompaniesToListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.addCompaniesToList(listId, body.companyIds, userWithOrg);
  }

  @Delete(':id/companies')
  @UseGuards(JwtAuthGuard)
  async removeCompaniesFromList(
    @Param('id') listId: string,
    @Body(new ValidationPipe({ transform: true })) body: RemoveCompaniesFromListDto,
    @CurrentUser() user: any,
    @CurrentOrganization() organizationId: string,
  ) {
    const userWithOrg = createMockUser(organizationId);
    return this.companyListsService.removeCompaniesFromList(listId, body.companyIds, userWithOrg);
  }
}