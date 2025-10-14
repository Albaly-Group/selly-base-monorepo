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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ReferenceDataService } from './reference-data.service';
import {
  CreateIndustryCodeDto,
  UpdateIndustryCodeDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateTagDto,
  UpdateTagDto,
} from '../../dtos';

@ApiTags('reference-data')
@Controller('reference-data')
export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  @Get('industries')
  @ApiOperation({ summary: 'Get all industries' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Industries retrieved successfully',
  })
  async getIndustries(
    @Query('active') active?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const industries = await this.referenceDataService.getIndustries(isActive);
    return { data: industries };
  }

  @Get('provinces')
  @ApiOperation({ summary: 'Get all provinces' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiQuery({
    name: 'countryCode',
    required: false,
    description: 'Filter by country code (default: TH)',
  })
  @ApiResponse({ status: 200, description: 'Provinces retrieved successfully' })
  async getProvinces(
    @Query('active') active?: string,
    @Query('countryCode') countryCode?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const provinces = await this.referenceDataService.getProvinces(
      isActive,
      countryCode || 'TH',
    );
    return { data: provinces };
  }

  @Get('company-sizes')
  @ApiOperation({ summary: 'Get all company sizes' })
  @ApiResponse({
    status: 200,
    description: 'Company sizes retrieved successfully',
  })
  async getCompanySizes(): Promise<{ data: any[] }> {
    const sizes = await this.referenceDataService.getCompanySizes();
    return { data: sizes };
  }

  @Get('contact-statuses')
  @ApiOperation({ summary: 'Get all contact statuses' })
  @ApiResponse({
    status: 200,
    description: 'Contact statuses retrieved successfully',
  })
  async getContactStatuses(): Promise<{ data: any[] }> {
    const statuses = await this.referenceDataService.getContactStatuses();
    return { data: statuses };
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags(@Query('active') active?: string): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const tags = await this.referenceDataService.getTags(isActive);
    return { data: tags };
  }

  // ========================================
  // Industry Codes CRUD Endpoints
  // ========================================

  @Post('industry-codes')
  @ApiOperation({ summary: 'Create a new industry code' })
  @ApiResponse({
    status: 201,
    description: 'Industry code created successfully',
  })
  async createIndustryCode(@Body() createDto: CreateIndustryCodeDto) {
    return await this.referenceDataService.createIndustryCode(createDto);
  }

  @Get('industry-codes/hierarchical')
  @ApiOperation({ summary: 'Get all industry codes with hierarchical data' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Industry codes with hierarchy retrieved successfully',
  })
  async getIndustryCodesHierarchical(
    @Query('active') active?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const industryCodes =
      await this.referenceDataService.getIndustryCodesHierarchical(isActive);
    return { data: industryCodes };
  }

  @Get('industry-codes/:id')
  @ApiOperation({ summary: 'Get industry code by ID' })
  @ApiParam({ name: 'id', description: 'Industry code ID' })
  @ApiResponse({
    status: 200,
    description: 'Industry code retrieved successfully',
  })
  async getIndustryCodeById(@Param('id') id: string) {
    return await this.referenceDataService.getIndustryCodeById(id);
  }

  @Put('industry-codes/:id')
  @ApiOperation({ summary: 'Update industry code' })
  @ApiParam({ name: 'id', description: 'Industry code ID' })
  @ApiResponse({
    status: 200,
    description: 'Industry code updated successfully',
  })
  async updateIndustryCode(
    @Param('id') id: string,
    @Body() updateDto: UpdateIndustryCodeDto,
  ) {
    return await this.referenceDataService.updateIndustryCode(id, updateDto);
  }

  @Delete('industry-codes/:id')
  @ApiOperation({ summary: 'Delete industry code' })
  @ApiParam({ name: 'id', description: 'Industry code ID' })
  @ApiResponse({
    status: 200,
    description: 'Industry code deleted successfully',
  })
  async deleteIndustryCode(@Param('id') id: string) {
    await this.referenceDataService.deleteIndustryCode(id);
    return { message: 'Industry code deleted successfully' };
  }

  // ========================================
  // Regions CRUD Endpoints
  // ========================================

  @Post('regions')
  @ApiOperation({ summary: 'Create a new region' })
  @ApiResponse({ status: 201, description: 'Region created successfully' })
  async createRegion(@Body() createDto: CreateRegionDto) {
    return await this.referenceDataService.createRegion(createDto);
  }

  @Get('regions/hierarchical')
  @ApiOperation({ summary: 'Get all regions with hierarchical data' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiQuery({
    name: 'countryCode',
    required: false,
    description: 'Filter by country code',
  })
  @ApiResponse({
    status: 200,
    description: 'Regions with hierarchy retrieved successfully',
  })
  async getRegionsHierarchical(
    @Query('active') active?: string,
    @Query('countryCode') countryCode?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const regions = await this.referenceDataService.getRegionsHierarchical(
      isActive,
      countryCode,
    );
    return { data: regions };
  }

  @Get('regions/:id')
  @ApiOperation({ summary: 'Get region by ID' })
  @ApiParam({ name: 'id', description: 'Region ID' })
  @ApiResponse({ status: 200, description: 'Region retrieved successfully' })
  async getRegionById(@Param('id') id: string) {
    return await this.referenceDataService.getRegionById(id);
  }

  @Put('regions/:id')
  @ApiOperation({ summary: 'Update region' })
  @ApiParam({ name: 'id', description: 'Region ID' })
  @ApiResponse({ status: 200, description: 'Region updated successfully' })
  async updateRegion(
    @Param('id') id: string,
    @Body() updateDto: UpdateRegionDto,
  ) {
    return await this.referenceDataService.updateRegion(id, updateDto);
  }

  @Delete('regions/:id')
  @ApiOperation({ summary: 'Delete region' })
  @ApiParam({ name: 'id', description: 'Region ID' })
  @ApiResponse({ status: 200, description: 'Region deleted successfully' })
  async deleteRegion(@Param('id') id: string) {
    await this.referenceDataService.deleteRegion(id);
    return { message: 'Region deleted successfully' };
  }

  // ========================================
  // Tags CRUD Endpoints
  // ========================================

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async createTag(@Body() createDto: CreateTagDto) {
    return await this.referenceDataService.createTag(createDto);
  }

  @Get('tags/hierarchical')
  @ApiOperation({ summary: 'Get all tags with hierarchical data' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags with hierarchy retrieved successfully',
  })
  async getTagsHierarchical(
    @Query('active') active?: string,
  ): Promise<{ data: any[] }> {
    const isActive = active === 'false' ? false : true;
    const tags = await this.referenceDataService.getTagsHierarchical(isActive);
    return { data: tags };
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  async getTagById(@Param('id') id: string) {
    return await this.referenceDataService.getTagById(id);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  async updateTag(@Param('id') id: string, @Body() updateDto: UpdateTagDto) {
    return await this.referenceDataService.updateTag(id, updateDto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  async deleteTag(@Param('id') id: string) {
    await this.referenceDataService.deleteTag(id);
    return { message: 'Tag deleted successfully' };
  }
}
