import { apiClient } from '@/lib/api-client';
import { CompanyCore, CompanySummary, CompanyDetail } from '@/lib/types/company-lists';
import { User } from '@/lib/types';

interface SearchFilters {
  q?: string;
  province?: string;
  companySize?: string[];
  dataSource?: string[];
  verificationStatus?: string;
  dataSensitivity?: string[];
  includeSharedData?: boolean;
  page?: number;
  limit?: number;
}

interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

interface CompanyCreateRequest {
  companyNameEn: string;
  companyNameTh?: string | null;
  businessDescription?: string | null;
  province?: string | null;
  websiteUrl?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  dataSource: 'customer_input';  // Only allow customer input for new companies
  sourceReference?: string | null;
  dataSensitivity?: 'standard' | 'confidential' | 'restricted';
}

interface CompanyUpdateRequest {
  companyNameEn?: string;
  companyNameTh?: string | null;
  businessDescription?: string | null;
  province?: string | null;
  websiteUrl?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  dataSensitivity?: 'public' | 'standard' | 'confidential' | 'restricted';
  tags?: string[];
}

export class ApiCompaniesService {
  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  /**
   * Search companies using the API backend
   */
  async searchCompanies(filters: SearchFilters = {}): Promise<SearchResult<CompanySummary>> {
    try {
      // Convert filters to API format
      const apiParams = {
        searchTerm: filters.q,
        organizationId: this.user.organization_id,
        includeSharedData: filters.includeSharedData,
        page: filters.page || 1,
        limit: filters.limit || 25,
        province: filters.province,
        verificationStatus: filters.verificationStatus,
        // Handle array filters - API expects comma-separated strings
        dataSource: filters.dataSource?.join(','),
        dataSensitivity: filters.dataSensitivity?.join(','),
        companySize: filters.companySize?.join(','),
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(apiParams).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.searchCompanies(cleanParams);
      
      // Convert API response to our expected format
      return {
        items: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        hasNextPage: response.pagination.hasNext,
      };
    } catch (error) {
      console.error('API search failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.searchCompanies(filters);
    }
  }

  /**
   * Get company details by ID
   */
  async getCompanyById(id: string): Promise<CompanyDetail | null> {
    try {
      const company = await apiClient.getCompanyById(id, this.user.organization_id || undefined);
      return company;
    } catch (error) {
      console.error('API getCompanyById failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.getCompanyById(id);
    }
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: CompanyCreateRequest): Promise<CompanyDetail> {
    try {
      // Add organization context to the company data
      const apiData = {
        ...companyData,
        organizationId: this.user.organization_id,
        createdBy: this.user.id,
      };

      const company = await apiClient.createCompany(apiData);
      return company;
    } catch (error) {
      console.error('API createCompany failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.createCompany(companyData);
    }
  }

  /**
   * Update an existing company
   */
  async updateCompany(id: string, updateData: CompanyUpdateRequest): Promise<CompanyDetail | null> {
    try {
      const company = await apiClient.updateCompany(id, updateData);
      return company;
    } catch (error) {
      console.error('API updateCompany failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.updateCompany(id, updateData);
    }
  }

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<boolean> {
    try {
      const result = await apiClient.deleteCompany(id, this.user.organization_id || undefined);
      return result.success;
    } catch (error) {
      console.error('API deleteCompany failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.deleteCompany(id);
    }
  }

  /**
   * Bulk create companies
   */
  async bulkCreateCompanies(companies: CompanyCreateRequest[]): Promise<CompanyDetail[]> {
    try {
      // Add organization context to all companies
      const apiData = companies.map(company => ({
        ...company,
        organizationId: this.user.organization_id,
        createdBy: this.user.id,
      }));

      const result = await apiClient.bulkCreateCompanies(apiData);
      return result;
    } catch (error) {
      console.error('API bulkCreateCompanies failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompaniesService } = await import('./companies-service');
      const fallbackService = new CompaniesService(this.user);
      return fallbackService.bulkCreateCompanies(companies);
    }
  }

  /**
   * Get all companies (with pagination)
   */
  async getCompanies(page = 1, limit = 25): Promise<SearchResult<CompanySummary>> {
    return this.searchCompanies({ page, limit });
  }
}

// Export the service for use in components
export { SearchFilters, SearchResult, CompanyCreateRequest, CompanyUpdateRequest };