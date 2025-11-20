import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyRegistrationsService } from './company-registrations.service';
import {
  CreateCompanyRegistrationDto,
  UpdateCompanyRegistrationDto,
} from '../../dtos/company-registration.dto';

@ApiTags('Company Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company-registrations')
export class CompanyRegistrationsController {
  constructor(
    private readonly registrationsService: CompanyRegistrationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company registration created successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async create(@Body() createDto: CreateCompanyRegistrationDto) {
    return await this.registrationsService.create(createDto);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all registrations for a company' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of company registrations',
  })
  async findByCompany(@Param('companyId') companyId: string) {
    return await this.registrationsService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company registration by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company registration details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company registration not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.registrationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company registration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company registration updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company registration not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyRegistrationDto,
  ) {
    return await this.registrationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a company registration' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Company registration deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company registration not found',
  })
  async remove(@Param('id') id: string) {
    await this.registrationsService.remove(id);
  }
}
