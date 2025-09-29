import { User } from "@/lib/types";
import { 
  CompanyList, 
  CompanyListCreate, 
  CompanyListUpdate,
  CompanyListFilters,
  PaginatedCompanyLists,
  CompanyListItem,
  CompanyListItemFilters,
  PaginatedCompanyListItems,
  BulkCompanyIds,
  BulkCompanyIdsWithNote,
  BulkAddResult,
  BulkRemoveResult,
  CompanySummary
} from "@/lib/types/company-lists";
import { apiClient } from '@/lib/api-client';

/**
 * API-based service layer for Company Lists operations
 * Uses the NestJS backend API with fallback to original service
 */
export class ApiCompanyListsService {
  constructor(private user: User) {}

  /**
   * List company lists accessible to the current user
   */
  async listCompanyLists(filters: CompanyListFilters): Promise<PaginatedCompanyLists> {
    try {
      const lists = await apiClient.getCompanyLists(this.user.organization_id || undefined);
      
      // Convert API response to expected format
      const companyLists: CompanyList[] = lists.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || '',
        ownerUserId: list.ownerUserId || list.userId,
        visibility: list.visibility || 'private',
        isShared: list.visibility === 'shared' || list.visibility === 'org',
        itemCount: list.itemCount || 0,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      }));

      // Apply client-side filtering for scope (API might not support this yet)
      let filteredLists = companyLists;
      if (filters.scope === 'mine') {
        filteredLists = companyLists.filter(list => list.ownerUserId === this.user.id);
      } else if (filters.scope === 'shared') {
        filteredLists = companyLists.filter(list => list.isShared);
      }

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLists = filteredLists.filter(list =>
          list.name.toLowerCase().includes(searchLower) ||
          list.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      const paginatedLists = filteredLists.slice(offset, offset + limit);

      return {
        items: paginatedLists,
        total: filteredLists.length,
        page,
        limit,
        totalPages: Math.ceil(filteredLists.length / limit),
        hasNext: offset + limit < filteredLists.length,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('API listCompanyLists failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.listCompanyLists(filters);
    }
  }

  /**
   * Get a specific company list by ID
   */
  async getCompanyList(id: string): Promise<CompanyList | null> {
    try {
      const list = await apiClient.getCompanyListById(id, this.user.organization_id || undefined);
      
      if (!list) return null;

      return {
        id: list.id,
        name: list.name,
        description: list.description || '',
        ownerUserId: list.ownerUserId || list.userId,
        visibility: list.visibility || 'private',
        isShared: list.visibility === 'shared' || list.visibility === 'org',
        itemCount: list.itemCount || 0,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };
    } catch (error) {
      console.error('API getCompanyList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.getCompanyList(id);
    }
  }

  /**
   * Create a new company list
   */
  async createCompanyList(data: CompanyListCreate): Promise<CompanyList> {
    try {
      const apiData = {
        ...data,
        organizationId: this.user.organization_id,
        userId: this.user.id,
      };

      const list = await apiClient.createCompanyList(apiData);
      
      return {
        id: list.id,
        name: list.name,
        description: list.description || '',
        ownerUserId: list.ownerUserId || list.userId,
        visibility: list.visibility || 'private',
        isShared: list.visibility === 'shared' || list.visibility === 'org',
        itemCount: list.itemCount || 0,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };
    } catch (error) {
      console.error('API createCompanyList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.createCompanyList(data);
    }
  }

  /**
   * Update an existing company list
   */
  async updateCompanyList(id: string, data: CompanyListUpdate): Promise<CompanyList | null> {
    try {
      const list = await apiClient.updateCompanyList(id, data);
      
      if (!list) return null;

      return {
        id: list.id,
        name: list.name,
        description: list.description || '',
        ownerUserId: list.ownerUserId || list.userId,
        visibility: list.visibility || 'private',
        isShared: list.visibility === 'shared' || list.visibility === 'org',
        itemCount: list.itemCount || 0,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };
    } catch (error) {
      console.error('API updateCompanyList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.updateCompanyList(id, data);
    }
  }

  /**
   * Delete a company list
   */
  async deleteCompanyList(id: string): Promise<boolean> {
    try {
      const result = await apiClient.deleteCompanyList(id);
      return result.success;
    } catch (error) {
      console.error('API deleteCompanyList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.deleteCompanyList(id);
    }
  }

  /**
   * Get companies in a specific list
   */
  async getListItems(listId: string, filters: CompanyListItemFilters): Promise<PaginatedCompanyListItems> {
    try {
      const items = await apiClient.getCompanyListItems(listId, this.user.organization_id || undefined);
      
      // Convert API response to expected format
      const companyListItems: CompanyListItem[] = items.map((item: any) => ({
        id: item.id,
        companyId: item.companyId,
        listId: item.listId,
        addedAt: item.addedAt || item.createdAt,
        addedBy: item.addedBy || item.userId,
        note: item.note || '',
        company: item.company ? {
          id: item.company.id,
          displayName: item.company.displayName || item.company.companyNameEn,
          registrationId: item.company.registrationId,
          province: item.company.province,
          websiteUrl: item.company.websiteUrl,
          primaryEmail: item.company.primaryEmail,
          primaryPhone: item.company.primaryPhone,
          dataSource: item.company.dataSource,
          isSharedData: item.company.isSharedData || false,
          qualityScore: item.company.qualityScore || 0,
          verificationStatus: item.company.verificationStatus || 'unverified',
        } : null,
      }));

      // Apply search filter
      let filteredItems = companyListItems;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = companyListItems.filter(item =>
          item.company?.displayName.toLowerCase().includes(searchLower) ||
          item.company?.registrationId?.toLowerCase().includes(searchLower) ||
          item.note.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const offset = (page - 1) * limit;
      const paginatedItems = filteredItems.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total: filteredItems.length,
        page,
        limit,
        totalPages: Math.ceil(filteredItems.length / limit),
        hasNext: offset + limit < filteredItems.length,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error('API getListItems failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.getListItems(listId, filters);
    }
  }

  /**
   * Add companies to a list
   */
  async addCompaniesToList(listId: string, data: BulkCompanyIdsWithNote): Promise<BulkAddResult> {
    try {
      await apiClient.addCompaniesToList(listId, data.companyIds);
      
      return {
        addedCount: data.companyIds.length,
        skippedCount: 0,
        errors: [],
      };
    } catch (error) {
      console.error('API addCompaniesToList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.addCompaniesToList(listId, data);
    }
  }

  /**
   * Remove companies from a list
   */
  async removeCompaniesFromList(listId: string, data: BulkCompanyIds): Promise<BulkRemoveResult> {
    try {
      await apiClient.removeCompaniesFromList(listId, data.companyIds);
      
      return {
        removedCount: data.companyIds.length,
        errors: [],
      };
    } catch (error) {
      console.error('API removeCompaniesFromList failed, using fallback service:', error);
      // Fall back to original service if API fails
      const { CompanyListsService } = await import('./company-lists-service');
      const fallbackService = new CompanyListsService(this.user);
      return fallbackService.removeCompaniesFromList(listId, data);
    }
  }
}

export { CompanyListFilters, PaginatedCompanyLists, CompanyListItemFilters, PaginatedCompanyListItems };