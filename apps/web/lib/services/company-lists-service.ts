import { User } from "@/lib/types"
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
} from "@/lib/types/company-lists"
import { canAccessList, hasPermission } from "@/lib/auth/api-auth"
import { apiClient } from "@/lib/api-client"

/**
 * Service layer for Company Lists operations
 * Uses backend API for all operations
 */
export class CompanyListsService {
  constructor(private user: User) {}

  /**
   * List company lists accessible to the current user
   */
  async listCompanyLists(filters: CompanyListFilters): Promise<PaginatedCompanyLists> {
    // Use API client to fetch company lists from backend
    try {
      const response = await apiClient.getCompanyLists(filters);
      return response;
    } catch (error) {
      console.error('Failed to fetch company lists:', error);
      throw new Error('Unable to fetch company lists. Please ensure the backend is running.');
    }
  }

  /**
   * Create a new company list
   */
  async createCompanyList(data: CompanyListCreate): Promise<CompanyList> {
    try {
      const response = await apiClient.createCompanyList(data);
      return response;
    } catch (error) {
      console.error('Failed to create company list:', error);
      throw new Error('Unable to create company list. Please ensure the backend is running.');
    }
  }

  /**
   * Get a specific company list
   */
  async getCompanyList(listId: string): Promise<CompanyList | null> {
    try {
      const response = await apiClient.getCompanyListById(listId);
      
      // Check access permissions
      if (!canAccessList(this.user, response)) {
        return null;
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch company list:', error);
      return null;
    }
  }

  /**
   * Update a company list
   */
  async updateCompanyList(listId: string, data: CompanyListUpdate): Promise<CompanyList | null> {
    const list = await this.getCompanyList(listId);
    if (!list) {
      return null;
    }

    // Check if user owns the list or has update permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:update-any')) {
      throw new Error('FORBIDDEN');
    }

    try {
      const response = await apiClient.updateCompanyList(listId, data);
      return response;
    } catch (error) {
      console.error('Failed to update company list:', error);
      throw new Error('Unable to update company list. Please ensure the backend is running.');
    }
  }

  /**
   * Delete a company list
   */
  async deleteCompanyList(listId: string): Promise<boolean> {
    const list = await this.getCompanyList(listId);
    if (!list) {
      return false;
    }

    // Check if user owns the list or has delete permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:delete-any')) {
      throw new Error('FORBIDDEN');
    }

    try {
      await apiClient.deleteCompanyList(listId);
      return true;
    } catch (error) {
      console.error('Failed to delete company list:', error);
      return false;
    }
  }

  /**
   * Get items in a company list
   */
  async listCompanyListItems(
    listId: string, 
    filters: CompanyListItemFilters
  ): Promise<PaginatedCompanyListItems> {
    const list = await this.getCompanyList(listId);
    if (!list) {
      throw new Error('LIST_NOT_FOUND');
    }

    try {
      const response = await apiClient.getCompanyListItems(listId, filters);
      return response;
    } catch (error) {
      console.error('Failed to fetch company list items:', error);
      throw new Error('Unable to fetch company list items. Please ensure the backend is running.');
    }
  }

  /**
   * Add companies to a list (bulk operation)
   */
  async addCompaniesToList(
    listId: string, 
    data: BulkCompanyIdsWithNote
  ): Promise<BulkAddResult> {
    const list = await this.getCompanyList(listId);
    if (!list) {
      throw new Error('LIST_NOT_FOUND');
    }

    // Check permissions - user owns list or has modify permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:modify-any')) {
      throw new Error('FORBIDDEN');
    }

    try {
      const response = await apiClient.addCompaniesToList(listId, data);
      return response;
    } catch (error) {
      console.error('Failed to add companies to list:', error);
      throw new Error('Unable to add companies to list. Please ensure the backend is running.');
    }
  }

  /**
   * Remove companies from a list (bulk operation)
   */
  async removeCompaniesFromList(
    listId: string, 
    data: BulkCompanyIds
  ): Promise<BulkRemoveResult> {
    const list = await this.getCompanyList(listId);
    if (!list) {
      throw new Error('LIST_NOT_FOUND');
    }

    // Check permissions - user owns list or has modify permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:modify-any')) {
      throw new Error('FORBIDDEN');
    }

    try {
      const response = await apiClient.removeCompaniesFromList(listId, data);
      return response;
    } catch (error) {
      console.error('Failed to remove companies from list:', error);
      throw new Error('Unable to remove companies from list. Please ensure the backend is running.');
    }
  }
}