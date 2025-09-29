import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../../database/entities/company.entity';

export interface SearchFilters {
  searchTerm?: string;
  organizationId?: string;
  includeSharedData?: boolean;
  dataSensitivity?: 'public' | 'standard' | 'confidential' | 'restricted';
  dataSource?: 'albaly_list' | 'dbd_registry' | 'customer_input' | 'data_enrichment' | 'third_party';
  verificationStatus?: 'verified' | 'unverified' | 'disputed' | 'inactive';
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  province?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
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
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async searchCompanies(filters: SearchFilters): Promise<SearchResult<Company>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    let queryBuilder: SelectQueryBuilder<Company> = this.companiesRepository
      .createQueryBuilder('company');

    // Apply organization scoping
    if (filters.organizationId) {
      if (filters.includeSharedData) {
        queryBuilder = queryBuilder.where(
          '(company.organization_id = :orgId OR company.is_shared_data = true)',
          { orgId: filters.organizationId }
        );
      } else {
        queryBuilder = queryBuilder.where(
          'company.organization_id = :orgId',
          { orgId: filters.organizationId }
        );
      }
    } else if (filters.includeSharedData === false) {
      queryBuilder = queryBuilder.where('company.is_shared_data = false');
    }

    // Apply search term
    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm.toLowerCase()}%`;
      queryBuilder = queryBuilder.andWhere(
        `(
          LOWER(company.display_name) LIKE :searchTerm OR 
          LOWER(company.company_name_en) LIKE :searchTerm OR 
          LOWER(company.company_name_th) LIKE :searchTerm OR 
          company.registration_id LIKE :searchTerm OR
          LOWER(company.primary_email) LIKE :searchTerm
        )`,
        { searchTerm }
      );
    }

    // Apply additional filters
    if (filters.dataSensitivity) {
      queryBuilder = queryBuilder.andWhere('company.data_sensitivity = :dataSensitivity', {
        dataSensitivity: filters.dataSensitivity,
      });
    }

    if (filters.dataSource) {
      queryBuilder = queryBuilder.andWhere('company.data_source = :dataSource', {
        dataSource: filters.dataSource,
      });
    }

    if (filters.verificationStatus) {
      queryBuilder = queryBuilder.andWhere('company.verification_status = :verificationStatus', {
        verificationStatus: filters.verificationStatus,
      });
    }

    if (filters.companySize) {
      queryBuilder = queryBuilder.andWhere('company.company_size = :companySize', {
        companySize: filters.companySize,
      });
    }

    if (filters.province) {
      queryBuilder = queryBuilder.andWhere('company.province_detected = :province', {
        province: filters.province,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const companies = await queryBuilder
      .orderBy('company.data_quality_score', 'DESC')
      .addOrderBy('company.updated_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string, organizationId?: string): Promise<Company | null> {
    let queryBuilder = this.companiesRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id });

    // Apply organization scoping if provided
    if (organizationId) {
      queryBuilder = queryBuilder.andWhere(
        '(company.organization_id = :orgId OR company.is_shared_data = true)',
        { orgId: organizationId }
      );
    }

    return queryBuilder.getOne();
  }

  async createCompany(companyData: Partial<Company>, organizationId: string, createdBy: string): Promise<Company> {
    const company = this.companiesRepository.create({
      ...companyData,
      organization_id: organizationId,
      dataSource: 'customer_input',
      isSharedData: false,
      dataSensitivity: 'standard',
      verificationStatus: 'unverified',
      dataQualityScore: 0.5, // Default score for new entries
      createdBy,
      updatedBy: createdBy,
    });

    return this.companiesRepository.save(company);
  }

  async updateCompany(
    id: string,
    updateData: Partial<Company>,
    organizationId: string,
    updatedBy: string
  ): Promise<Company | null> {
    // First check if the company exists and belongs to the organization
    const existingCompany = await this.findById(id, organizationId);
    if (!existingCompany) {
      return null;
    }

    // Don't allow updating shared data
    if (existingCompany.isSharedData) {
      throw new Error('Cannot update shared company data');
    }

    await this.companiesRepository.update(id, {
      ...updateData,
      updatedBy,
      updatedAt: new Date(),
    });

    return this.findById(id, organizationId);
  }

  async deleteCompany(id: string, organizationId: string): Promise<boolean> {
    const company = await this.findById(id, organizationId);
    if (!company || company.isSharedData) {
      return false; // Can't delete shared data
    }

    const result = await this.companiesRepository.delete(id);
    return !!(result.affected && result.affected > 0);
  }
}