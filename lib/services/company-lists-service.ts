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
import { mockCompanies, mockUserLists } from "@/lib/mock-data"
import { canAccessList, hasPermission } from "@/lib/auth/api-auth"

/**
 * Service layer for Company Lists operations
 * In production, this would interact with a database
 */
export class CompanyListsService {
  constructor(private user: User) {}

  /**
   * List company lists accessible to the current user
   */
  async listCompanyLists(filters: CompanyListFilters): Promise<PaginatedCompanyLists> {
    // Convert mock data to new format
    let lists: CompanyList[] = mockUserLists.map(list => ({
      id: list.id,
      name: list.name,
      description: `Mock list created on ${list.createdAt}`,
      ownerUserId: list.owner === 'user@example.com' ? 'user-1' : 'admin-1',
      visibility: 'private' as const,
      isShared: false,
      itemCount: list.companyIds.length,
      createdAt: new Date(list.createdAt).toISOString(),
      updatedAt: new Date(list.createdAt).toISOString()
    }))

    // Apply scope filter
    if (filters.scope === 'mine') {
      lists = lists.filter(list => list.ownerUserId === this.user.id)
    } else if (filters.scope === 'shared') {
      lists = lists.filter(list => list.isShared && canAccessList(this.user, list))
    } else if (filters.scope === 'org') {
      lists = lists.filter(list => list.visibility === 'org' && canAccessList(this.user, list))
    }

    // Apply search filter
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase()
      lists = lists.filter(list => 
        list.name.toLowerCase().includes(searchTerm) ||
        (list.description && list.description.toLowerCase().includes(searchTerm))
      )
    }

    // Apply pagination
    const total = lists.length
    const start = (filters.page! - 1) * filters.limit!
    const paginatedLists = lists.slice(start, start + filters.limit!)

    return {
      items: paginatedLists,
      page: filters.page!,
      limit: filters.limit!,
      total
    }
  }

  /**
   * Create a new company list
   */
  async createCompanyList(data: CompanyListCreate): Promise<CompanyList> {
    const now = new Date().toISOString()
    const newList: CompanyList = {
      id: `list-${Math.random().toString(36).substring(7)}`,
      name: data.name,
      description: data.description || null,
      ownerUserId: this.user.id,
      visibility: data.visibility || 'private',
      isShared: data.isShared || false,
      itemCount: 0,
      createdAt: now,
      updatedAt: now
    }

    // In production, save to database here
    
    return newList
  }

  /**
   * Get a specific company list
   */
  async getCompanyList(listId: string): Promise<CompanyList | null> {
    const mockList = mockUserLists.find(list => list.id === listId)
    if (!mockList) {
      return null
    }

    const list: CompanyList = {
      id: mockList.id,
      name: mockList.name,
      description: `Mock list created on ${mockList.createdAt}`,
      ownerUserId: mockList.owner === 'user@example.com' ? 'user-1' : 'admin-1',
      visibility: 'private',
      isShared: false,
      itemCount: mockList.companyIds.length,
      createdAt: new Date(mockList.createdAt).toISOString(),
      updatedAt: new Date(mockList.createdAt).toISOString()
    }

    // Check access permissions
    if (!canAccessList(this.user, list)) {
      return null
    }

    return list
  }

  /**
   * Update a company list
   */
  async updateCompanyList(listId: string, data: CompanyListUpdate): Promise<CompanyList | null> {
    const list = await this.getCompanyList(listId)
    if (!list) {
      return null
    }

    // Check if user owns the list or has update permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:update-any')) {
      throw new Error('FORBIDDEN')
    }

    // Update fields
    const updatedList: CompanyList = {
      ...list,
      name: data.name ?? list.name,
      description: data.description ?? list.description,
      visibility: data.visibility ?? list.visibility,
      isShared: data.isShared ?? list.isShared,
      updatedAt: new Date().toISOString()
    }

    // In production, save to database here
    
    return updatedList
  }

  /**
   * Delete a company list
   */
  async deleteCompanyList(listId: string): Promise<boolean> {
    const list = await this.getCompanyList(listId)
    if (!list) {
      return false
    }

    // Check if user owns the list or has delete permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:delete-any')) {
      throw new Error('FORBIDDEN')
    }

    // In production, delete from database here
    
    return true
  }

  /**
   * Get items in a company list
   */
  async listCompanyListItems(
    listId: string, 
    filters: CompanyListItemFilters
  ): Promise<PaginatedCompanyListItems> {
    const list = await this.getCompanyList(listId)
    if (!list) {
      throw new Error('LIST_NOT_FOUND')
    }

    // Get mock list data
    const mockList = mockUserLists.find(l => l.id === listId)
    if (!mockList) {
      throw new Error('LIST_NOT_FOUND')
    }

    // Get companies in the list
    let companies = mockCompanies.filter(company => mockList.companyIds.includes(company.id))

    // Apply search filter
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase()
      companies = companies.filter(company => 
        company.companyNameEn.toLowerCase().includes(searchTerm)
      )
    }

    // Apply province filter
    if (filters['filters[province]']) {
      companies = companies.filter(company => 
        company.province === filters['filters[province]']
      )
    }

    // Convert to CompanyListItems
    const items: CompanyListItem[] = companies.map((company, index) => ({
      itemId: `item-${company.id}-${listId}`,
      note: null,
      position: index,
      addedAt: new Date().toISOString(),
      addedByUserId: this.user.id,
      company: {
        companyId: company.id,
        name: company.companyNameEn,
        registrationNo: company.registeredNo || null,
        province: company.province,
        country: 'TH',
        website: null,
        headTags: [{ key: 'industry', name: company.industrialName }],
        classifications: [{ tsic: '99999', titleEn: company.industrialName }],
        contactsCount: company.contactPersons.length
      }
    }))

    // Apply sorting
    if (filters.sortBy === 'name') {
      items.sort((a, b) => {
        const comparison = a.company.name.localeCompare(b.company.name)
        return filters.sortDir === 'desc' ? -comparison : comparison
      })
    }

    // For cursor-based pagination, we'd use nextCursor in production
    const limit = filters.limit || 25
    const paginatedItems = items.slice(0, limit)

    return {
      items: paginatedItems,
      nextCursor: items.length > limit ? `cursor-${limit}` : null
    }
  }

  /**
   * Add companies to a list (bulk operation)
   */
  async addCompaniesToList(
    listId: string, 
    data: BulkCompanyIdsWithNote
  ): Promise<BulkAddResult> {
    const list = await this.getCompanyList(listId)
    if (!list) {
      throw new Error('LIST_NOT_FOUND')
    }

    // Check permissions - user owns list or has modify permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:modify-any')) {
      throw new Error('FORBIDDEN')
    }

    // Validate company IDs exist
    const added: string[] = []
    const skipped: Array<{ companyId: string; reason: 'DUPLICATE' | 'NOT_FOUND' }> = []

    for (const companyId of data.companyIds) {
      const company = mockCompanies.find(c => c.id === companyId)
      if (!company) {
        skipped.push({ companyId, reason: 'NOT_FOUND' })
        continue
      }

      // Check if already in list (mock check)
      const mockList = mockUserLists.find(l => l.id === listId)
      if (mockList?.companyIds.includes(companyId)) {
        skipped.push({ companyId, reason: 'DUPLICATE' })
        continue
      }

      added.push(companyId)
    }

    // In production, update database here
    
    return {
      listId,
      added,
      skipped
    }
  }

  /**
   * Remove companies from a list (bulk operation)
   */
  async removeCompaniesFromList(
    listId: string, 
    data: BulkCompanyIds
  ): Promise<BulkRemoveResult> {
    const list = await this.getCompanyList(listId)
    if (!list) {
      throw new Error('LIST_NOT_FOUND')
    }

    // Check permissions - user owns list or has modify permissions
    if (list.ownerUserId !== this.user.id && !hasPermission(this.user, 'company-lists:modify-any')) {
      throw new Error('FORBIDDEN')
    }

    // Mock implementation
    const removed: string[] = []
    const missing: string[] = []

    for (const companyId of data.companyIds) {
      const mockList = mockUserLists.find(l => l.id === listId)
      if (mockList?.companyIds.includes(companyId)) {
        removed.push(companyId)
      } else {
        missing.push(companyId)
      }
    }

    // In production, update database here
    
    return {
      listId,
      removed,
      missing
    }
  }
}