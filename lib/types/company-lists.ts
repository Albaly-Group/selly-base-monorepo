/**
 * Company Lists Entity Models
 * Maps to PostgreSQL schema: common_company_lists, common_company_registrations, etc.
 */

// Core entity types matching DB schema
export interface CompanyCore {
  id: string
  companyNameEn: string
  companyNameTh?: string | null
  registrationId?: string | null
  dunsNumber?: string | null
  addressLine?: string | null
  district?: string | null
  amphoe?: string | null
  provinceDetected?: string | null
  countryCode?: string | null
  businessTypeText?: string | null
  description?: string | null
  website?: string | null
  linkedinUrl?: string | null
  logoUrl?: string | null
  tel?: string | null
  email?: string | null
  mainShareholderNationality?: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanyRegistration {
  registrationNo: string
  registrationStatus?: string | null
  registeredDate?: string | null
  deregisteredDate?: string | null
  countryCode?: string | null
  authorityId?: string | null
  registrationTypeId?: string | null
  isPrimary: boolean
}

export interface CompanyTag {
  tagId: string
  key: string
  name: string
  category: {
    id: string
    key: string
    name: string
  }
  parentId?: string | null
  depth: number
}

export interface CompanyClassification {
  source: string
  tsicCode?: string | null
  businessTypeText?: string | null
  objectiveText?: string | null
  effectiveDate?: string | null
  filingYear?: number | null
  isPrimary: boolean
}

export interface CompanyContact {
  id: string
  fullName: string
  title?: string | null
  email?: string | null
  phone?: string | null
  linkedinUrl?: string | null
}

export interface ShareholderNationality {
  year: number
  topNationality: string
  totals: {
    totalShares: number
    totalInvestmentValueBaht: number
    totalInvestmentPercent: number
  }
}

// Company List entities
export interface CompanyList {
  id: string
  name: string
  description?: string | null
  ownerUserId: string
  visibility: 'private' | 'org' | 'public'
  isShared: boolean
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface CompanyListItem {
  itemId: string
  note?: string | null
  position?: number | null
  addedAt: string
  addedByUserId: string
  company: CompanySummary
}

// Summary/aggregated views
export interface CompanySummary {
  companyId: string
  name: string
  registrationNo?: string | null
  province?: string | null
  country?: string | null
  website?: string | null
  headTags: Array<{
    key: string
    name: string
  }>
  classifications: Array<{
    tsic: string
    titleEn: string
  }>
  contactsCount: number
}

export interface CompanyDetail {
  core: CompanyCore
  primaryRegistration?: CompanyRegistration | null
  tags: CompanyTag[]
  classifications: CompanyClassification[]
  shareholderNationalityLatest?: ShareholderNationality | null
  contacts: {
    total: number
    items: CompanyContact[]
  }
}

// API Request/Response types
export interface CompanyListCreate {
  name: string
  description?: string
  visibility?: 'private' | 'org' | 'public'
  isShared?: boolean
}

export interface CompanyListUpdate {
  name?: string
  description?: string
  visibility?: 'private' | 'org' | 'public'
  isShared?: boolean
}

// Bulk operations
export interface BulkCompanyIds {
  companyIds: string[]
}

export interface BulkCompanyIdsWithNote extends BulkCompanyIds {
  note?: string
}

export interface BulkAddResult {
  listId: string
  added: string[]
  skipped: Array<{
    companyId: string
    reason: 'DUPLICATE' | 'NOT_FOUND'
  }>
}

export interface BulkRemoveResult {
  listId: string
  removed: string[]
  missing: string[]
}

// Pagination types
export interface PaginatedCompanyLists {
  items: CompanyList[]
  page: number
  limit: number
  total: number
}

export interface PaginatedCompanyListItems {
  items: CompanyListItem[]
  nextCursor?: string | null
}

export interface PaginatedCompanies {
  items: CompanySummary[]
  page: number
  limit: number
  total: number
}

// Filter and search types
export interface CompanyListFilters {
  scope?: 'mine' | 'shared' | 'org'
  q?: string
  page?: number
  limit?: number
}

export interface CompanyListItemFilters {
  limit?: number
  nextCursor?: string
  sortBy?: 'name' | 'createdAt' | 'position'
  sortDir?: 'asc' | 'desc'
  'filters[province]'?: string
  'filters[tagKey]'?: string
  'filters[tsic]'?: string
  q?: string
}

export interface CompanyBrowseFilters {
  q?: string
  province?: string
  tsic?: string
  tagKey?: string
  page?: number
  limit?: number
}

// API Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  traceId?: string
}

// Reorder operations
export interface ReorderMove {
  companyId: string
  position: number
}

export interface ReorderRequest {
  moves: ReorderMove[]
}