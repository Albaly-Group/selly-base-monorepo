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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CompanyContactsService } from './company-contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  CreateCompanyContactDto,
  UpdateCompanyContactDto,
} from '../../dtos/company-contact.dto';

@ApiTags('company-contacts')
@Controller('company-contacts')
export class CompanyContactsController {
  constructor(
    private readonly companyContactsService: CompanyContactsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get contacts with optional company filter' })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filter by company ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
  })
  async getContacts(
    @Query('companyId') companyId?: string,
  ): Promise<{ data: any[] }> {
    const contacts = await this.companyContactsService.getContacts(companyId);
    return { data: contacts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async getContactById(@Param('id') id: string): Promise<any> {
    return this.companyContactsService.getContactById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new company contact' })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createContact(
    @Body() createDto: CreateCompanyContactDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.companyContactsService.createContact(createDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a company contact' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateContact(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyContactDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.companyContactsService.updateContact(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a company contact' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteContact(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return this.companyContactsService.deleteContact(id, user);
  }
}
