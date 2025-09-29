import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company, Organization, User } from '../../entities';

interface CompanySearchParams {
  searchTerm?: string;
  organizationId?: string;
  includeSharedData?: boolean;
  page?: number;
  limit?: number;
  dataSensitivity?: string;
  dataSource?: string;
  verificationStatus?: string;
  companySize?: string;
  province?: string;
}

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

interface CompanyCreateRequest {
  companyNameEn: string;
  companyNameTh?: string;
  businessDescription?: string;
  websiteUrl?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  addressLine1?: string;
  province?: string;
  countryCode?: string;
  tags?: string[];
}

interface CompanyUpdateRequest extends Partial<CompanyCreateRequest> {}

// Mock data for demonstration
const MOCK_COMPANIES = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    nameEn: 'Albaly Digital',
    nameTh: 'อัลบาลี ดิจิทัล',
    displayName: 'Albaly Digital',
    organizationId: '123e4567-e89b-12d3-a456-426614174001',
    businessDescription: 'Digital transformation and software development company',
    websiteUrl: 'https://albaly.com',
    primaryEmail: 'info@albaly.com',
    province: 'Bangkok',
    countryCode: 'TH',
    dataSource: 'customer_input',
    isSharedData: false,
    verificationStatus: 'verified',
    companySize: 'medium',
    dataQualityScore: 0.95,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    tags: ['technology', 'software'],
    contacts: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    nameEn: 'Sample Tech Corp',
    nameTh: 'บริษัท ตัวอย่าง เทค จำกัด',
    displayName: 'Sample Tech Corp',
    organizationId: null,
    businessDescription: 'Sample technology company for demonstration',
    websiteUrl: 'https://sample-tech.com',
    primaryEmail: 'contact@sample-tech.com',
    province: 'Bangkok',
    countryCode: 'TH',
    dataSource: 'albaly_list',
    isSharedData: true,
    verificationStatus: 'verified',
    companySize: 'large',
    dataQualityScore: 0.89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    tags: ['technology', 'enterprise'],
    contacts: [],
  },
];

@Injectable()
export class CompaniesService {
  constructor(
    @Optional() @InjectRepository(Company)
    private companyRepository?: Repository<Company>,
    @Optional() @InjectRepository(Organization)
    private organizationRepository?: Repository<Organization>,
  ) {}

  async searchCompanies(
    params: CompanySearchParams,
    user?: User
  ): Promise<PaginatedResponse<any>> {
    // If database is available, use real implementation
    if (this.companyRepository) {
      return this.searchCompaniesFromDatabase(params, user);
    }

    // Otherwise, use mock data
    return this.searchCompaniesFromMockData(params, user);
  }

  private async searchCompaniesFromDatabase(
    params: CompanySearchParams,
    user?: User
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
      province,
    } = params;

    let query = this.companyRepository!
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.contacts', 'contacts')
      .leftJoinAndSelect('company.organization', 'organization');

    // Multi-tenant filtering
    if (organizationId) {
      // Verify user has access to this organization
      if (user && user.organizationId !== organizationId) {
        throw new ForbiddenException('Access denied to organization');
      }
      
      if (includeSharedData) {
        query.where('(company.organizationId = :organizationId OR company.isSharedData = true)', {
          organizationId,
        });
      } else {
        query.where('company.organizationId = :organizationId', { organizationId });
      }
    } else if (includeSharedData) {
      query.where('company.isSharedData = true');
    }

    // Text search
    if (searchTerm) {
      query.andWhere(
        '(company.nameEn ILIKE :searchTerm OR company.nameTh ILIKE :searchTerm OR company.businessDescription ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      );
    }

    // Apply filters
    if (dataSensitivity) {
      query.andWhere('company.dataSensitivity = :dataSensitivity', { dataSensitivity });
    }

    if (dataSource) {
      query.andWhere('company.dataSource = :dataSource', { dataSource });
    }

    if (verificationStatus) {
      query.andWhere('company.verificationStatus = :verificationStatus', { verificationStatus });
    }

    if (companySize) {
      query.andWhere('company.companySize = :companySize', { companySize });
    }

    if (province) {
      query.andWhere('company.province = :province', { province });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    // Order by relevance and quality
    query.orderBy('company.dataQualityScore', 'DESC')
      .addOrderBy('company.createdAt', 'DESC');

    const [companies, total] = await query.getManyAndCount();

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

  private async searchCompaniesFromMockData(
    params: CompanySearchParams,
    user?: User
  ): Promise<PaginatedResponse<any>> {
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
      province,
    } = params;

    let companies = [...MOCK_COMPANIES];

    // Multi-tenant filtering
    if (organizationId) {
      companies = companies.filter(company => 
        company.organizationId === organizationId || (includeSharedData && company.isSharedData)
      );
    } else if (includeSharedData) {
      companies = companies.filter(company => company.isSharedData);
    }

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      companies = companies.filter(company =>
        company.nameEn.toLowerCase().includes(term) ||
        company.nameTh?.toLowerCase().includes(term) ||
        company.businessDescription?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (dataSource) {
      companies = companies.filter(company => company.dataSource === dataSource);
    }

    if (verificationStatus) {
      companies = companies.filter(company => company.verificationStatus === verificationStatus);
    }

    if (companySize) {
      companies = companies.filter(company => company.companySize === companySize);
    }

    if (province) {
      companies = companies.filter(company => company.province === province);
    }

    // Pagination
    const total = companies.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCompanies = companies.slice(offset, offset + limit);

    return {
      data: paginatedCompanies,
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

  async getCompanyById(id: string, organizationId?: string): Promise<any> {
    if (this.companyRepository) {
      return this.getCompanyByIdFromDatabase(id, organizationId);
    }

    return this.getCompanyByIdFromMockData(id, organizationId);
  }

  private async getCompanyByIdFromDatabase(id: string, organizationId?: string): Promise<Company> {
    let query = this.companyRepository!
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.contacts', 'contacts')
      .leftJoinAndSelect('company.organization', 'organization')
      .where('company.id = :id', { id });

    // Multi-tenant access control
    if (organizationId) {
      query.andWhere('(company.organizationId = :organizationId OR company.isSharedData = true)', {
        organizationId,
      });
    } else {
      query.andWhere('company.isSharedData = true');
    }

    const company = await query.getOne();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  private async getCompanyByIdFromMockData(id: string, organizationId?: string): Promise<any> {
    const company = MOCK_COMPANIES.find(c => c.id === id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Multi-tenant access control
    if (organizationId && company.organizationId !== organizationId && !company.isSharedData) {
      throw new NotFoundException('Company not found');
    } else if (!organizationId && !company.isSharedData) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async createCompany(data: CompanyCreateRequest, user: User): Promise<any> {
    const company = {
      id: `company-${Date.now()}`,
      nameEn: data.companyNameEn,
      nameTh: data.companyNameTh,
      displayName: data.companyNameEn || data.companyNameTh || 'Unnamed Company',
      organizationId: user.organizationId,
      businessDescription: data.businessDescription,
      websiteUrl: data.websiteUrl,
      primaryEmail: data.primaryEmail,
      primaryPhone: data.primaryPhone,
      addressLine1: data.addressLine1,
      province: data.province,
      countryCode: data.countryCode || 'TH',
      tags: data.tags || [],
      dataSource: 'customer_input',
      isSharedData: false,
      verificationStatus: 'unverified',
      dataQualityScore: 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      contacts: [],
    };

    // In a real implementation, this would save to database
    console.log('Created company:', company);
    return company;
  }

  async updateCompany(id: string, data: CompanyUpdateRequest, user: User): Promise<any> {
    const company = await this.getCompanyById(id, user.organizationId);

    // Only allow updates to companies in user's organization
    if (company.organizationId !== user.organizationId && !company.isSharedData) {
      throw new ForbiddenException('Cannot update this company');
    }

    const updatedCompany = {
      ...company,
      nameEn: data.companyNameEn || company.nameEn,
      nameTh: data.companyNameTh || company.nameTh,
      displayName: data.companyNameEn || data.companyNameTh || company.displayName,
      businessDescription: data.businessDescription || company.businessDescription,
      websiteUrl: data.websiteUrl || company.websiteUrl,
      primaryEmail: data.primaryEmail || company.primaryEmail,
      primaryPhone: data.primaryPhone || company.primaryPhone,
      addressLine1: data.addressLine1 || company.addressLine1,
      province: data.province || company.province,
      countryCode: data.countryCode || company.countryCode,
      tags: data.tags || company.tags,
      updatedAt: new Date(),
    };

    console.log('Updated company:', updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string, user: User): Promise<void> {
    const company = await this.getCompanyById(id, user.organizationId);

    // Only allow deletion of companies in user's organization
    if (company.organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot delete this company');
    }

    console.log('Deleted company:', id);
  }

  async getCompaniesByIds(ids: string[], organizationId?: string): Promise<any[]> {
    const companies = MOCK_COMPANIES.filter(company => 
      ids.includes(company.id) && 
      (company.organizationId === organizationId || company.isSharedData)
    );

    return companies;
  }
}