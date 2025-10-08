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
                province: searchDto.province,
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
      countryCode,
      tags,
    } = searchDto;

    const query = this.companyRepository
      .createQueryBuilder('company')
      // Note: contacts relation not yet defined in entity
      // .leftJoinAndSelect('company.contacts', 'contacts')
      .leftJoinAndSelect('company.organization', 'organization');

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
          :searchTerm = ANY(company.tags)
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
      // Search in JSONB array for industry classification
      query.andWhere(`company.industryClassification::text ILIKE :industrial`, {
        industrial: `%${industrial}%`,
      });
    }

    if (province) {
      query.andWhere('company.province ILIKE :province', {
        province: `%${province}%`,
      });
    }

    if (countryCode) {
      query.andWhere('company.countryCode = :countryCode', { countryCode });
    }

    if (tags && tags.length > 0) {
      query.andWhere('company.tags && :tags', { tags });
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
    if (!user || !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    try {
      const companyData = {
        // Don't set id - let database auto-generate UUID
        nameEn: createDto.companyNameEn,
        nameTh: createDto.companyNameTh || null,
        // Don't set displayName - it's a GENERATED column in the database
        primaryRegistrationNo: createDto.primaryRegistrationNo || null,
        organizationId: user.organizationId,
        businessDescription: createDto.businessDescription || null,
        websiteUrl: createDto.websiteUrl || null,
        primaryEmail: createDto.primaryEmail || null,
        primaryPhone: createDto.primaryPhone || null,
        addressLine1: createDto.addressLine1 || null,
        addressLine2: createDto.addressLine2 || null,
        district: createDto.district || null,
        subdistrict: createDto.subdistrict || null,
        province: createDto.province || null,
        postalCode: createDto.postalCode || null,
        countryCode: createDto.countryCode || 'TH',
        companySize: createDto.companySize || 'small',
        employeeCountEstimate: createDto.employeeCountEstimate || null,
        tags: createDto.tags || [],
        dataSensitivity: createDto.dataSensitivity || 'standard',
        dataSource: 'customer_input',
        isSharedData: false,
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
        primaryRegistrationNo: companyData.primaryRegistrationNo || undefined,
        businessDescription: companyData.businessDescription || undefined,
        websiteUrl: companyData.websiteUrl || undefined,
        primaryEmail: companyData.primaryEmail || undefined,
        primaryPhone: companyData.primaryPhone || undefined,
        addressLine1: companyData.addressLine1 || undefined,
        addressLine2: companyData.addressLine2 || undefined,
        district: companyData.district || undefined,
        subdistrict: companyData.subdistrict || undefined,
        province: companyData.province || undefined,
        postalCode: companyData.postalCode || undefined,
        employeeCountEstimate: companyData.employeeCountEstimate || undefined,
      };

      const company = this.companyRepository.create(cleanedData);
      const savedCompany = await this.companyRepository.save(company);

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
        ...savedCompany,
        companyNameEn: savedCompany.nameEn,
        companyNameTh: savedCompany.nameTh,
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

    if (!user || !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    try {
      const existingCompany = await this.getCompanyById(
        id,
        user.organizationId,
        user,
      );

      // Enhanced authorization check
      if (
        existingCompany.organizationId !== user.organizationId &&
        !existingCompany.isSharedData
      ) {
        throw new ForbiddenException(
          'Cannot update this company - insufficient permissions',
        );
      }

      // Check if user can update shared data
      if (existingCompany.isSharedData) {
        // Check if user has permission to manage shared data
        const hasSharedDataPermission = (user as any).permissions?.some(
          (p: any) => p.key === 'shared-data:manage' || p.key === '*',
        );
        
        if (!hasSharedDataPermission) {
          throw new ForbiddenException(
            'Cannot update shared data companies - requires shared-data:manage permission',
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
        primaryRegistrationNo:
          updateDto.primaryRegistrationNo !== undefined
            ? updateDto.primaryRegistrationNo
            : existingCompany.primaryRegistrationNo,
        businessDescription:
          updateDto.businessDescription !== undefined
            ? updateDto.businessDescription
            : existingCompany.businessDescription,
        websiteUrl:
          updateDto.websiteUrl !== undefined
            ? updateDto.websiteUrl
            : existingCompany.websiteUrl,
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
        district:
          updateDto.district !== undefined
            ? updateDto.district
            : existingCompany.district,
        subdistrict:
          updateDto.subdistrict !== undefined
            ? updateDto.subdistrict
            : existingCompany.subdistrict,
        province:
          updateDto.province !== undefined
            ? updateDto.province
            : existingCompany.province,
        postalCode:
          updateDto.postalCode !== undefined
            ? updateDto.postalCode
            : existingCompany.postalCode,
        countryCode:
          updateDto.countryCode !== undefined
            ? updateDto.countryCode
            : existingCompany.countryCode,
        companySize:
          updateDto.companySize !== undefined
            ? updateDto.companySize
            : existingCompany.companySize,
        employeeCountEstimate:
          updateDto.employeeCountEstimate !== undefined
            ? updateDto.employeeCountEstimate
            : existingCompany.employeeCountEstimate,
        tags:
          updateDto.tags !== undefined ? updateDto.tags : existingCompany.tags,
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
      // Remove GENERATED columns from update data (displayName, searchVector)
      const { displayName, searchVector, ...updateData } = updatedCompany;
      await this.companyRepository.update(id, updateData);
      const savedCompany = await this.companyRepository.findOne({
        where: { id },
      });

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

  async deleteCompany(id: string, user: User): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Company ID is required');
    }

    if (!user || !user.organizationId) {
      throw new BadRequestException(
        'User organization information is required',
      );
    }

    try {
      const company = await this.getCompanyById(id, user.organizationId, user);

      // Enhanced authorization
      if (company.organizationId !== user.organizationId) {
        throw new ForbiddenException(
          'Cannot delete this company - insufficient permissions',
        );
      }

      if (company.isSharedData) {
        throw new ForbiddenException('Cannot delete shared data companies');
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
        // Note: contacts relation not yet defined in entity
        // .leftJoinAndSelect('company.contacts', 'contacts')
        .leftJoinAndSelect('company.organization', 'organization')
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

  // Helper methods
  private calculateDataQualityScore(
    data: CreateCompanyDto | UpdateCompanyDto,
    existingData?: any,
  ): number {
    let score = 0.0;
    let maxScore = 0.0;

    const checkField = (field: any, weight: number) => {
      maxScore += weight;
      if (field && field.toString().trim() !== '') {
        score += weight;
      }
    };

    // Combine new data with existing for updates
    const combinedData = existingData ? { ...existingData, ...data } : data;

    checkField(combinedData.companyNameEn || combinedData.nameEn, 0.2);
    checkField(combinedData.businessDescription, 0.15);
    checkField(combinedData.websiteUrl, 0.1);
    checkField(combinedData.primaryEmail, 0.1);
    checkField(combinedData.primaryPhone, 0.1);
    checkField(combinedData.addressLine1, 0.1);
    checkField(combinedData.province, 0.05);
    checkField(combinedData.primaryRegistrationNo, 0.15);
    checkField(combinedData.tags && combinedData.tags.length > 0, 0.05);

    return Math.min(1.0, Math.round((score / maxScore) * 100) / 100);
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
      'primaryRegistrationNo',
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
