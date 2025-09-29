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
import { CompaniesService } from './companies.service';
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

// Temporary mock user for development (will be replaced with real auth)
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

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('search')
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

    return this.companiesService.searchCompanies(searchParams, mockUser);
  }

  @Get()
  async getCompanies(@Query() query: CompanySearchQuery): Promise<PaginatedResponse<any>> {
    // Legacy endpoint that uses search underneath
    return this.searchCompanies(query);
  }

  @Get(':id')
  async getCompanyById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.companiesService.getCompanyById(id, organizationId || mockUser.organizationId);
  }

  @Post()
  async createCompany(@Body() createCompanyDto: any) {
    return this.companiesService.createCompany(createCompanyDto, mockUser);
  }

  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: any,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto, mockUser);
  }

  @Delete(':id')
  async deleteCompany(@Param('id') id: string) {
    await this.companiesService.deleteCompany(id, mockUser);
    return { message: 'Company deleted successfully' };
  }

  @Post('bulk')
  async getCompaniesByIds(
    @Body('ids') ids: string[],
    @Query('organizationId') organizationId?: string,
  ) {
    return this.companiesService.getCompaniesByIds(ids, organizationId || mockUser.organizationId);
  }
}