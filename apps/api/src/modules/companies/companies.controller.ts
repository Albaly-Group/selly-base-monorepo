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
import { LeadScoringService } from './lead-scoring.service';
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
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly leadScoringService: LeadScoringService,
  ) {}

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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createCompany(
    @Body() createDto: CreateCompanyDto,
    @CurrentUser() user: Users,
  ) {
    return this.companiesService.createCompany(createDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateCompany(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyDto,
    @CurrentUser() user: Users,
  ) {
    return this.companiesService.updateCompany(id, updateDto, user);
  }

  @Post(':id/calculate-score')
  @ApiOperation({ summary: 'Calculate lead score for a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Organization ID for access control',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead score calculated successfully',
    schema: {
      properties: {
        companyId: { type: 'string' },
        score: { type: 'number' },
        breakdown: {
          type: 'object',
          properties: {
            dataQuality: { type: 'number' },
            companySize: { type: 'number' },
            industry: { type: 'number' },
            location: { type: 'number' },
            engagement: { type: 'number' },
            verification: { type: 'number' },
            total: { type: 'number' },
          },
        },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async calculateCompanyScore(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
    @Body()
    weights?: {
      dataQuality?: number;
      companySize?: number;
      industry?: number;
      location?: number;
      engagement?: number;
      verification?: number;
    },
  ) {
    const company = await this.companiesService.getCompanyById(
      id,
      organizationId,
      undefined,
    );
    const { score, breakdown } = this.leadScoringService.calculateLeadScore(
      company,
      weights,
    );
    const recommendations =
      this.leadScoringService.getImprovementRecommendations(company);

    return {
      companyId: company.id,
      score,
      breakdown,
      recommendations,
    };
  }

  @Post('calculate-scores')
  @ApiOperation({ summary: 'Calculate lead scores for multiple companies' })
  @ApiResponse({
    status: 200,
    description: 'Lead scores calculated successfully',
    schema: {
      properties: {
        results: {
          type: 'array',
          items: {
            properties: {
              companyId: { type: 'string' },
              score: { type: 'number' },
              breakdown: { type: 'object' },
            },
          },
        },
      },
    },
  })
  async calculateBulkScores(
    @Body() body: { companyIds: string[]; weights?: any },
    @Query('organizationId') organizationId?: string,
  ) {
    const companies = [];

    for (const companyId of body.companyIds) {
      try {
        const company = await this.companiesService.getCompanyById(
          companyId,
          organizationId,
          undefined,
        );
        companies.push(company);
      } catch (error) {
        // Skip companies that can't be found
        continue;
      }
    }

    const results = this.leadScoringService.calculateBulkLeadScores(
      companies,
      body.weights,
    );

    return { results };
  }
}
