import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import {
  Companies,
  Organizations,
  Users,
  Companies as Company,
  Organizations as Organization,
  Users as User,
} from '../../entities';
import { AuditService } from '../audit/audit.service';
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

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private readonly companyRepository: Repository<Companies>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
    private readonly auditService: AuditService,
  ) {}

  async searchCompanies(
    searchDto: CompanySearchDto,
    user?: User,
  ): Promise<PaginatedResponse<any>> {
    const startTime = Date.now();

    try {
      // Database implementation only - no mock data fallback
      const result = await this.searchCompaniesFromDatabase(searchDto, user);

      // Log search operation
      if (user && searchDto.searchTerm) {
        await this.auditService.logSearchOperation(
          user,
          searchDto.searchTerm,
          result.data.length,
          {
            metadata: {
              filters: {
                organizationId: searchDto.organizationId,
                includeSharedData: searchDto.includeSharedData,
                dataSensitivity: searchDto.dataSensitivity,
                dataSource: searchDto.dataSource,
                verificationStatus: searchDto.verificationStatus,
                companySize: searchDto.companySize,
                industrial: searchDto.industrial,
                province: searchDto.province,
                primaryIndustryId: searchDto.primaryIndustryId,
                primaryRegionId: searchDto.primaryRegionId,
              },
              executionTime: Date.now() - startTime,
              page: searchDto.page,
              limit: searchDto.limit,
            },
          },
        );
      }

      return result;
    } catch (error) {
      // Log error if audit service is available
      if (this.auditService && user) {
        await this.auditService.logUserAction(
          user,
          'SEARCH',
          'Company',
          undefined,
          {
            resourceType: 'search',
            resourcePath: '/api/companies/search',
            statusCode: 500,
            errorMessage: error.message,
          },
        );
      }
      throw error;
    }
  }

  private async searchCompaniesFromDatabase(
    searchDto: CompanySearchDto,
    user?: User,
  ): Promise<PaginatedResponse<Company>> {
    const {
      searchTerm,
      organizationId,
      includeSharedData = true,
      page = 1,
      limit = 50,
      dataSensitivity,
      dataSource,
      verificationStatus,
      companySize,
      industrial,
      province,
      primaryIndustryId,
      primaryRegionId,
    } = searchDto;

    const query = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.companyContacts', 'companyContacts')
      .leftJoinAndSelect('company.companyRegistrations', 'companyRegistrations')
      .leftJoinAndSelect('company.organization', 'organization')
      .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
      .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
      .leftJoin('company.companyTags', 'companyTags')
      .leftJoin('companyTags.tag', 'tag');

    // Multi-tenant filtering with enhanced security
    if (organizationId) {
      // Verify user has access to this organization
      if (user && user.organizationId !== organizationId) {
        throw new ForbiddenException('Access denied to organization data');
      }

      if (includeSharedData) {
        query.where(
          '(company.organizationId = :organizationId OR company.isSharedData = true)',
          {
            organizationId,
          },
        );
      } else {
        query.where('company.organizationId = :organizationId', {
          organizationId,
        });
      }
    } else {
      // When no organizationId is provided, only allow shared data access
      if (includeSharedData) {
        query.where('company.isSharedData = true');
      } else {
        throw new ForbiddenException(
          'Organization ID is required for non-shared data access',
        );
      }
    }

    // Enhanced text search with full-text capabilities
    if (searchTerm) {
      query.andWhere(
        `(
          company.nameEn ILIKE :searchTerm OR 
          company.nameTh ILIKE :searchTerm OR 
          company.displayName ILIKE :searchTerm OR 
          company.businessDescription ILIKE :searchTerm OR
          company.primaryEmail ILIKE :searchTerm OR
          tag.key ILIKE :searchTerm OR
          tag.name ILIKE :searchTerm
        )`,
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // Apply enhanced filters
    if (dataSensitivity) {
      query.andWhere('company.dataSensitivity = :dataSensitivity', {
        dataSensitivity,
      });
    }

    if (dataSource) {
      query.andWhere('company.dataSource = :dataSource', { dataSource });
    }

    if (verificationStatus) {
      query.andWhere('company.verificationStatus = :verificationStatus', {
        verificationStatus,
      });
    }

    if (companySize) {
      query.andWhere('company.companySize = :companySize', { companySize });
    }

    if (industrial) {
      // Search in industry classification via the primaryIndustry relation
      query.andWhere(
        '(primaryIndustry.code ILIKE :industrial OR primaryIndustry.titleEn ILIKE :industrial)',
        {
          industrial: `%${industrial}%`,
        },
      );
    }

    if (primaryIndustryId) {
      query.andWhere('company.primaryIndustryId = :primaryIndustryId', {
        primaryIndustryId,
      });
    }

    if (province) {
      // Search in province via the primaryRegion relation
      query.andWhere(
        '(primaryRegion.nameEn ILIKE :province OR primaryRegion.nameTh ILIKE :province)',
        {
          province: `%${province}%`,
        },
      );
    }

    if (primaryRegionId) {
      query.andWhere('company.primaryRegionId = :primaryRegionId', {
        primaryRegionId,
      });
    }

    // Enhanced pagination with validation
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    query.skip(offset).take(validatedLimit);

    // Optimized ordering for better performance
    query
      .orderBy('company.dataQualityScore', 'DESC')
      .addOrderBy('company.updatedAt', 'DESC');

    const [companies, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / validatedLimit);

    return {
      data: companies,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };
  }

  async getCompanyById(
    id: string,
    organizationId?: string,
    user?: User,
  ): Promise<any> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Company ID is required');
    }

    try {
      const company = await this.getCompanyByIdFromDatabase(
        id,
        organizationId,
        user,
      );

      // Log read operation
      if (user) {
        await this.auditService.logCompanyOperation(user, 'READ', id, {
          metadata: { organizationId },
        });
      }

      return company;
    } catch (error) {
      // Log error
      if (user) {
        await this.auditService.logCompanyOperation(user, 'READ', id, {
          statusCode: error.status || 500,
          errorMessage: error.message,
        });
      }
      throw error;
    }
  }

  private async getCompanyByIdFromDatabase(
    id: string,
    organizationId?: string,
    user?: User,
  ): Promise<Company> {
    const query = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.organization', 'organization')
      .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
      .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
      .leftJoinAndSelect('company.companyRegistrations', 'companyRegistrations')
      .leftJoinAndSelect('company.companyContacts', 'companyContacts')
      .where('company.id = :id', { id });

    if (organizationId) {
      if (user && user.organizationId !== organizationId) {
        throw new ForbiddenException('Access denied to organization data');
      }

      query.andWhere(
        '(company.organizationId = :organizationId OR company.isSharedData = true)',
        {
          organizationId,
        },
      );
    } else {
      query.andWhere('company.isSharedData = true');
    }

    const company = await query.getOne();

    if (!company) {
      throw new NotFoundException('Company not found or access denied');
    }

    return company;
  }

  async createCompany(createDto: CreateCompanyDto, user: User): Promise<any> {
    if (!user) {
      throw new BadRequestException('User information is required');
    }

    // Check if user is platform admin
    const isPlatformAdmin = (user as any).permissions?.some(
      (p: any) => p.key === 'shared-data:manage' || p.key === '*',
    );

    let isSharedData: boolean;
    let organizationId: string | null;

    if (isPlatformAdmin) {
      // Platform admin logic
      if (createDto.isSharedData === true) {
        isSharedData = true;
        organizationId = null;
      } else if (!user.organizationId) {
        isSharedData = true;
        organizationId = null;
      } else {
        isSharedData = false;
        organizationId = user.organizationId;
      }
    } else {
      if (!user.organizationId) {
        throw new BadRequestException(
          'User organization information is required',
        );
      }
      isSharedData = false;
      organizationId = user.organizationId;
    }

    try {
      const companyData = {
        nameEn: createDto.companyNameEn,
        nameTh: createDto.companyNameTh || null,
        organizationId: organizationId,
        dunsNumber: createDto.dunsNumber || null,
        businessDescription: createDto.businessDescription || null,
        websiteUrl: createDto.websiteUrl || null,
        linkedinUrl: createDto.linkedinUrl || null,
        facebookUrl: createDto.facebookUrl || null,
        primaryEmail: createDto.primaryEmail || null,
        primaryPhone: createDto.primaryPhone || null,
        addressLine1: createDto.addressLine1 || null,
        addressLine2: createDto.addressLine2 || null,
        postalCode: createDto.postalCode || null,
        establishedDate: createDto.establishedDate || null,
        companySize: createDto.companySize || 'small',
        employeeCountEstimate: createDto.employeeCountEstimate || null,
        primaryIndustryId: createDto.primaryIndustryId || null,
        primaryRegionId: createDto.primaryRegionId || null,
        dataSensitivity: createDto.dataSensitivity || 'standard',
        dataSource: 'customer_input',
        isSharedData: isSharedData,
        verificationStatus: 'unverified',
        dataQualityScore: this.calculateDataQualityScore(createDto).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id,
        updatedBy: user.id,
        contacts: [],
      };

      // Save to database
      // Clean the data for TypeORM by converting null to undefined
      const cleanedData = {
        ...companyData,
        nameTh: companyData.nameTh || undefined,
        dunsNumber: companyData.dunsNumber || undefined,
        businessDescription: companyData.businessDescription || undefined,
        websiteUrl: companyData.websiteUrl || undefined,
        linkedinUrl: companyData.linkedinUrl || undefined,
        facebookUrl: companyData.facebookUrl || undefined,
        primaryEmail: companyData.primaryEmail || undefined,
        primaryPhone: companyData.primaryPhone || undefined,
        addressLine1: companyData.addressLine1 || undefined,
        addressLine2: companyData.addressLine2 || undefined,
        postalCode: companyData.postalCode || undefined,
        establishedDate: companyData.establishedDate || undefined,
        employeeCountEstimate: companyData.employeeCountEstimate || undefined,
        primaryIndustryId: companyData.primaryIndustryId || undefined,
        primaryRegionId: companyData.primaryRegionId || undefined,
      };

      const company = this.companyRepository.create(cleanedData);
      const savedCompany = await this.companyRepository.save(company);

      // Reload with relations using QueryBuilder
      const companyWithRelations = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
        .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
        .leftJoinAndSelect(
          'company.companyRegistrations',
          'companyRegistrations',
        )
        .leftJoinAndSelect('company.companyContacts', 'companyContacts')
        .where('company.id = :id', { id: savedCompany.id })
        .getOne();

      if (!companyWithRelations) {
        throw new Error('Failed to reload created company');
      }

      // Recalculate score with loaded relations and update if different
      const finalScore = this.calculateDataQualityScore(
        companyWithRelations,
        companyWithRelations,
      );
      if (finalScore.toString() !== companyWithRelations.dataQualityScore) {
        await this.companyRepository.update(savedCompany.id, {
          dataQualityScore: finalScore.toString(),
        });
        companyWithRelations.dataQualityScore = finalScore.toString();
      }

      // Log creation
      if (this.auditService) {
        await this.auditService.logCompanyOperation(
          user,
          'CREATE',
          savedCompany.id,
          {
            newValues: companyData,
            metadata: { dataSource: 'customer_input' },
          },
        );
      }

      // Transform response to match DTO field names
      return {
        ...companyWithRelations,
        companyNameEn: companyWithRelations.nameEn,
        companyNameTh: companyWithRelations.nameTh,
      };
    } catch (error) {
      // Log error
      if (this.auditService && user) {
        await this.auditService.logUserAction(
          user,
          'CREATE',
          'Company',
          undefined,
          {
            resourceType: 'company',
            statusCode: error.status || 500,
            errorMessage: error.message,
          },
        );
      }
      throw error;
    }
  }

  async updateCompany(
    id: string,
    updateDto: UpdateCompanyDto,
    user: User,
  ): Promise<any> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Company ID is required');
    }

    if (!user) {
      throw new BadRequestException('User information is required');
    }

    // Check if user is platform admin with shared data permissions
    const isPlatformAdmin = (user as any).permissions?.some(
      (p: any) => p.key === 'shared-data:manage' || p.key === '*',
    );

    // For non-platform admins, organization ID is required
    if (!isPlatformAdmin && !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    try {
      // Load company with relations for accurate score calculation using QueryBuilder
      const existingCompany = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
        .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
        .leftJoinAndSelect(
          'company.companyRegistrations',
          'companyRegistrations',
        )
        .leftJoinAndSelect('company.companyContacts', 'companyContacts')
        .where('company.id = :id', { id })
        .getOne();

      if (!existingCompany) {
        throw new NotFoundException('Company not found or access denied');
      }

      // Verify access control
      if (
        user.organizationId &&
        existingCompany.organizationId !== user.organizationId &&
        !existingCompany.isSharedData
      ) {
        throw new ForbiddenException('Access denied to organization data');
      }

      // Enhanced authorization check
      if (existingCompany.isSharedData) {
        // For shared data, only platform admins can update
        if (!isPlatformAdmin) {
          throw new ForbiddenException(
            'Cannot update shared data companies - requires shared-data:manage permission',
          );
        }
      } else {
        // For non-shared data, user must own the company
        if (
          existingCompany.organizationId !== user.organizationId &&
          !isPlatformAdmin
        ) {
          throw new ForbiddenException(
            'Cannot update this company - insufficient permissions',
          );
        }
      }

      const oldValues = { ...existingCompany };
      const updatedCompany = {
        ...existingCompany,
        nameEn: updateDto.companyNameEn || existingCompany.nameEn,
        nameTh:
          updateDto.companyNameTh !== undefined
            ? updateDto.companyNameTh
            : existingCompany.nameTh,
        // displayName is a GENERATED column - don't include it in updates
        dunsNumber:
          updateDto.dunsNumber !== undefined
            ? updateDto.dunsNumber
            : existingCompany.dunsNumber,
        businessDescription:
          updateDto.businessDescription !== undefined
            ? updateDto.businessDescription
            : existingCompany.businessDescription,
        websiteUrl:
          updateDto.websiteUrl !== undefined
            ? updateDto.websiteUrl
            : existingCompany.websiteUrl,
        linkedinUrl:
          updateDto.linkedinUrl !== undefined
            ? updateDto.linkedinUrl
            : existingCompany.linkedinUrl,
        facebookUrl:
          updateDto.facebookUrl !== undefined
            ? updateDto.facebookUrl
            : existingCompany.facebookUrl,
        primaryEmail:
          updateDto.primaryEmail !== undefined
            ? updateDto.primaryEmail
            : existingCompany.primaryEmail,
        primaryPhone:
          updateDto.primaryPhone !== undefined
            ? updateDto.primaryPhone
            : existingCompany.primaryPhone,
        addressLine1:
          updateDto.addressLine1 !== undefined
            ? updateDto.addressLine1
            : existingCompany.addressLine1,
        addressLine2:
          updateDto.addressLine2 !== undefined
            ? updateDto.addressLine2
            : existingCompany.addressLine2,
        postalCode:
          updateDto.postalCode !== undefined
            ? updateDto.postalCode
            : existingCompany.postalCode,
        establishedDate:
          updateDto.establishedDate !== undefined
            ? updateDto.establishedDate
            : existingCompany.establishedDate,
        companySize:
          updateDto.companySize !== undefined
            ? updateDto.companySize
            : existingCompany.companySize,
        employeeCountEstimate:
          updateDto.employeeCountEstimate !== undefined
            ? updateDto.employeeCountEstimate
            : existingCompany.employeeCountEstimate,
        primaryIndustryId:
          updateDto.primaryIndustryId !== undefined
            ? updateDto.primaryIndustryId
            : existingCompany.primaryIndustryId,
        primaryRegionId:
          updateDto.primaryRegionId !== undefined
            ? updateDto.primaryRegionId
            : existingCompany.primaryRegionId,
        dataSensitivity:
          updateDto.dataSensitivity !== undefined
            ? updateDto.dataSensitivity
            : existingCompany.dataSensitivity,
        verificationStatus:
          updateDto.verificationStatus !== undefined
            ? updateDto.verificationStatus
            : existingCompany.verificationStatus,
        dataQualityScore: this.calculateDataQualityScore(
          updateDto,
          existingCompany,
        ),
        updatedAt: new Date(),
        updatedBy: user.id,
      };

      // Calculate changes for audit log
      const changes = this.calculateChanges(oldValues, updatedCompany);

      // Save to database
      // Build DB update payload: remove GENERATED columns and relation objects
      const {
        displayName,
        searchVector,
        primaryIndustry,
        primaryRegion,
        companyRegistrations,
        companyContacts,
        organization,
        companyTags,
        ...rest
      } = updatedCompany;

      const dbUpdate: any = {
        ...rest,
        // prefer values from incoming DTO when provided (allow null)
        primaryIndustryId:
          updateDto.primaryIndustryId !== undefined
            ? updateDto.primaryIndustryId
            : existingCompany.primaryIndustryId,
        primaryRegionId:
          updateDto.primaryRegionId !== undefined
            ? updateDto.primaryRegionId
            : existingCompany.primaryRegionId,
        // Don't calculate score here - will calculate after reload with relations
      };

      await this.companyRepository.update(id, dbUpdate);

      // Reload with relations using QueryBuilder
      const savedCompany = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
        .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
        .leftJoinAndSelect(
          'company.companyRegistrations',
          'companyRegistrations',
        )
        .leftJoinAndSelect('company.companyContacts', 'companyContacts')
        .where('company.id = :id', { id })
        .getOne();

      // Calculate score with loaded relations and update
      if (savedCompany) {
        const finalScore = this.calculateDataQualityScore(
          savedCompany,
          savedCompany,
        );
        await this.companyRepository.update(id, {
          dataQualityScore: finalScore.toString(),
        });
        savedCompany.dataQualityScore = finalScore.toString();
      }

      // Log update
      if (this.auditService) {
        await this.auditService.logCompanyOperation(user, 'UPDATE', id, {
          oldValues,
          newValues: updatedCompany,
          changes,
        });
      }

      return savedCompany;
    } catch (error) {
      // Log error
      if (this.auditService && user) {
        await this.auditService.logCompanyOperation(user, 'UPDATE', id, {
          statusCode: error.status || 500,
          errorMessage: error.message,
        });
      }
      throw error;
    }
  }

  async calculateCompanyDataCompleteness(
    companyId: string,
    updateDb: boolean = false,
  ): Promise<number> {
    if (!companyId || companyId.trim() === '') {
      throw new BadRequestException('Company ID is required');
    }

    // Load company with relations required for calculation
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
      .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
      .leftJoinAndSelect('company.companyRegistrations', 'companyRegistrations')
      .leftJoinAndSelect('company.companyContacts', 'companyContacts')
      .where('company.id = :id', { id: companyId })
      .getOne();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Use existing helpers to compute score from the loaded entity
    const score = this.calculateDataQualityScore(company, company);

    // Optionally persist the computed score back to the database
    if (updateDb) {
      try {
        await this.companyRepository.update(companyId, {
          dataQualityScore: score.toString(),
        });
        // reflect change on returned object if needed
        (company as any).dataQualityScore = score.toString();
      } catch (err) {
        // don't block returning the score if update fails - surface the error
        console.error('Failed to update dataQualityScore for', companyId, err);
        throw err;
      }
    }

    return score;
  }

  async deleteCompany(id: string, user: User): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Company ID is required');
    }

    if (!user) {
      throw new BadRequestException('User information is required');
    }

    // Check if user is platform admin
    const isPlatformAdmin = (user as any).permissions?.some(
      (p: any) => p.key === 'shared-data:manage' || p.key === '*',
    );

    // For non-platform admins, organization ID is required
    if (!isPlatformAdmin && !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    try {
      const company = await this.getCompanyById(
        id,
        user.organizationId || undefined,
        user,
      );

      // Enhanced authorization
      if (company.isSharedData) {
        // For shared data, only platform admins can delete
        if (!isPlatformAdmin) {
          throw new ForbiddenException(
            'Cannot delete shared data companies - requires shared-data:manage permission',
          );
        }
      } else {
        // For non-shared data, user must own the company (or be platform admin)
        if (
          company.organizationId !== user.organizationId &&
          !isPlatformAdmin
        ) {
          throw new ForbiddenException(
            'Cannot delete this company - insufficient permissions',
          );
        }
      }

      // Check for dependencies (lists, etc.)
      // In a real implementation, check if company is referenced in lists

      await this.companyRepository.delete(id);

      // Log deletion
      if (this.auditService) {
        await this.auditService.logCompanyOperation(user, 'DELETE', id, {
          oldValues: company,
        });
      }
    } catch (error) {
      // Log error
      if (this.auditService && user) {
        await this.auditService.logCompanyOperation(user, 'DELETE', id, {
          statusCode: error.status || 500,
          errorMessage: error.message,
        });
      }
      throw error;
    }
  }

  async getCompaniesByIds(
    bulkDto: BulkCompanyIdsDto,
    user?: User,
  ): Promise<any[]> {
    const { ids, organizationId } = bulkDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Company IDs array cannot be empty');
    }

    // Validate UUID format for all IDs
    const invalidIds = ids.filter(
      (id) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        ),
    );
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid UUID format for IDs: ${invalidIds.join(', ')}`,
      );
    }

    try {
      // Database implementation only - no mock data fallback
      const query = this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.organization', 'organization')
        .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
        .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
        .leftJoinAndSelect(
          'company.companyRegistrations',
          'companyRegistrations',
        )
        .leftJoinAndSelect('company.companyContacts', 'companyContacts')
        .where('company.id IN (:...ids)', { ids });

      // Apply multi-tenant filtering
      if (organizationId) {
        if (user && user.organizationId !== organizationId) {
          throw new ForbiddenException('Access denied to organization data');
        }
        query.andWhere(
          '(company.organizationId = :organizationId OR company.isSharedData = true)',
          {
            organizationId,
          },
        );
      } else {
        query.andWhere('company.isSharedData = true');
      }

      const companies = await query.getMany();

      // Log bulk read operation
      if (user) {
        await this.auditService.logUserAction(
          user,
          'READ',
          'Company',
          undefined,
          {
            resourceType: 'bulk_companies',
            resourcePath: '/api/companies/bulk',
            metadata: {
              requestedIds: ids.length,
              foundCompanies: companies.length,
              organizationId,
            },
          },
        );
      }

      return companies;
    } catch (error) {
      // Log error
      if (user) {
        await this.auditService.logUserAction(
          user,
          'READ',
          'Company',
          undefined,
          {
            resourceType: 'bulk_companies',
            resourcePath: '/api/companies/bulk',
            statusCode: error.status || 500,
            errorMessage: error.message,
            metadata: { requestedIds: ids.length },
          },
        );
      }
      throw error;
    }
  }

  async bulkCreateCompanies(
    companies: CreateCompanyDto[],
    user?: User,
  ): Promise<{ results: Array<any> }> {
    if (!user) {
      throw new BadRequestException('User information is required');
    }

    const isPlatformAdmin = (user as any).permissions?.some(
      (p: any) => p.key === 'shared-data:manage' || p.key === '*',
    );

    if (!isPlatformAdmin && !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    const results: Array<any> = [];

    for (let i = 0; i < companies.length; i++) {
      const companyDto = companies[i];
      try {
        const created = await this.createCompany(companyDto, user);
        results.push({ index: i, success: true, id: created.id });
      } catch (error) {
        // Capture error message(s) for the row; preserve as array
        const message = error?.message || 'Unknown error';
        results.push({ index: i, success: false, errors: [message] });
      }
    }

    // Log aggregate bulk create operation
    if (this.auditService && user) {
      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.length - successCount;
      await this.auditService.logUserAction(
        user,
        'CREATE',
        'CompanyBulk',
        undefined,
        {
          resourceType: 'bulk_companies_create',
          resourcePath: '/api/companies/bulk',
          metadata: {
            requested: results.length,
            successes: successCount,
            failures: failedCount,
          },
        },
      );
    }

    return { results };
  }

  // Helper methods
  private calculateDataQualityScore(
    data: CreateCompanyDto | UpdateCompanyDto | any,
    existingData?: any,
  ): number {
    // Combine new data with existing for updates
    const combinedData = existingData ? { ...existingData, ...data } : data;

    // Group 1: Company Detail (50% weight)
    const companyDetailScore = this.calculateCompanyDetailScore(combinedData);

    // Group 2: Company Registration Detail (30% weight)
    const registrationScore = this.calculateRegistrationScore(combinedData);

    // Group 3: Company Contact Detail (20% weight)
    const contactScore = this.calculateContactScore(combinedData);

    // Calculate weighted total score
    const totalScore =
      companyDetailScore * 0.5 + registrationScore * 0.3 + contactScore * 0.2;

    return Math.min(1.0, Math.round(totalScore * 100) / 100);
  }

  private calculateCompanyDetailScore(data: any): number {
    let score = 0.0;
    let maxScore = 0.0;

    const checkField = (field: any, weight: number) => {
      maxScore += weight;
      if (
        field !== null &&
        field !== undefined &&
        field.toString().trim() !== ''
      ) {
        score += weight;
      }
    };

    const checkEitherField = (field1: any, field2: any, weight: number) => {
      maxScore += weight;
      const hasField1 =
        field1 !== null &&
        field1 !== undefined &&
        field1.toString().trim() !== '';
      const hasField2 =
        field2 !== null &&
        field2 !== undefined &&
        field2.toString().trim() !== '';
      if (hasField1 || hasField2) {
        score += weight;
      }
    };

    // Company Name (En) OR Company Name (Th) - 15%
    checkEitherField(
      data.companyNameEn || data.nameEn,
      data.companyNameTh || data.nameTh,
      0.15,
    );

    // Business Description - 10%
    checkField(data.businessDescription, 0.1);

    // Company Email - 10%
    checkField(data.primaryEmail, 0.1);

    // Company Phone - 10%
    checkField(data.primaryPhone, 0.1);

    // Address Line1 OR Address Line2 - 10%
    checkEitherField(data.addressLine1, data.addressLine2, 0.1);

    // Region - 10%
    checkField(data.primaryRegionId, 0.1);

    // Company Industry - 15%
    checkField(data.primaryIndustryId, 0.15);

    // Company Size - 10%
    checkField(data.companySize, 0.1);

    // Employee Count - 10%
    checkField(data.employeeCountEstimate, 0.1);

    return maxScore > 0 ? score / maxScore : 0;
  }

  private calculateRegistrationScore(data: any): number {
    if (
      !data.companyRegistrations ||
      !Array.isArray(data.companyRegistrations)
    ) {
      return 0;
    }

    let score = 0.0;
    let maxScore = 0.0;

    const checkField = (field: any, weight: number) => {
      maxScore += weight;
      if (
        field !== null &&
        field !== undefined &&
        field.toString().trim() !== ''
      ) {
        score += weight;
      }
    };

    // Get the primary registration or first registration
    const primaryReg =
      data.companyRegistrations.find((r: any) => r.isPrimary) ||
      data.companyRegistrations[0];

    if (primaryReg) {
      // Registration Number - 40%
      checkField(primaryReg.registrationNo, 0.4);

      // Registration Authority - 30%
      checkField(primaryReg.authorityId, 0.3);

      // Registration Type - 30%
      checkField(primaryReg.registrationTypeId, 0.3);
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  private calculateContactScore(data: any): number {
    if (!data.companyContacts || !Array.isArray(data.companyContacts)) {
      return 0;
    }

    let totalScore = 0.0;
    let contactCount = 0;

    // Calculate score for each contact and average
    for (const contact of data.companyContacts) {
      let score = 0.0;
      let maxScore = 0.0;

      const checkField = (field: any, weight: number) => {
        maxScore += weight;
        if (
          field !== null &&
          field !== undefined &&
          field.toString().trim() !== ''
        ) {
          score += weight;
        }
      };

      const checkEitherField = (field1: any, field2: any, weight: number) => {
        maxScore += weight;
        const hasField1 =
          field1 !== null &&
          field1 !== undefined &&
          field1.toString().trim() !== '';
        const hasField2 =
          field2 !== null &&
          field2 !== undefined &&
          field2.toString().trim() !== '';
        if (hasField1 || hasField2) {
          score += weight;
        }
      };

      // FirstName OR FullName - 20%
      checkEitherField(contact.firstName, contact.fullName, 0.2);

      // Position (title) - 20%
      checkField(contact.title, 0.2);

      // Phone - 20%
      checkField(contact.phone, 0.2);

      // Email - 20%
      checkField(contact.email, 0.2);

      if (maxScore > 0) {
        totalScore += score / maxScore;
        contactCount++;
      }
    }

    return contactCount > 0 ? totalScore / contactCount : 0;
  }

  private calculateChanges(
    oldData: any,
    newData: any,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    const compareFields = [
      'nameEn',
      'nameTh',
      'displayName',
      'businessDescription',
      'websiteUrl',
      'primaryEmail',
      'primaryPhone',
      'addressLine1',
      'addressLine2',
      'province',
      'countryCode',
      'companySize',
      'employeeCountEstimate',
      'tags',
      'dataSensitivity',
    ];

    compareFields.forEach((field) => {
      if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
        changes[field] = {
          old: oldData[field],
          new: newData[field],
        };
      }
    });

    return changes;
  }
}
