import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CompanyListsService } from './company-lists.service';
import { User } from '../../entities';

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

// Mock user for development (same as companies controller)
const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  organizationId: '123e4567-e89b-12d3-a456-426614174001',
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
};

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
      organizationId: query.organizationId || mockUser.organizationId,
      visibility: query.visibility,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      scope: query.scope || 'mine',
    };

    return this.companyListsService.searchCompanyLists(searchParams, mockUser);
  }

  @Get(':id')
  async getCompanyListById(@Param('id') id: string) {
    return this.companyListsService.getCompanyListById(id, mockUser);
  }

  @Post()
  async createCompanyList(@Body() createListDto: any) {
    return this.companyListsService.createCompanyList(createListDto, mockUser);
  }

  @Put(':id')
  async updateCompanyList(
    @Param('id') id: string,
    @Body() updateListDto: any,
  ) {
    return this.companyListsService.updateCompanyList(id, updateListDto, mockUser);
  }

  @Delete(':id')
  async deleteCompanyList(@Param('id') id: string) {
    await this.companyListsService.deleteCompanyList(id, mockUser);
    return { message: 'Company list deleted successfully' };
  }

  @Get(':id/items')
  async getListItems(@Param('id') id: string) {
    return this.companyListsService.getListItems(id, mockUser);
  }

  @Post(':id/companies')
  async addCompaniesToList(
    @Param('id') listId: string,
    @Body() body: { companyIds: string[] },
  ) {
    return this.companyListsService.addCompaniesToList(listId, body.companyIds, mockUser);
  }

  @Delete(':id/companies')
  async removeCompaniesFromList(
    @Param('id') listId: string,
    @Body() body: { companyIds: string[] },
  ) {
    return this.companyListsService.removeCompaniesFromList(listId, body.companyIds, mockUser);
  }
}