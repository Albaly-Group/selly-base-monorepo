/**
 * Company Lists Entity Models
 * Maps to PostgreSQL schema: common_company_lists, common_company_registrations, etc.
 */

// Core entity types matching DB schema v2.0
export interface CompanyCore {
  id: string
  organization_id?: string | null
  companyNameEn: string
  companyNameTh?: string | null
  companyNameLocal?: string | null
  displayName: string
  registrationId?: string | null
  dunsNumber?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  district?: string | null
  subdistrict?: string | null
  provinceDetected?: string | null
  countryCode?: string | null
  businessDescription?: string | null
  establishedDate?: string | null
  employeeCountEstimate?: number | null
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise' | null
  annualRevenueEstimate?: number | null
  currencyCode?: string | null
  websiteUrl?: string | null
  linkedinUrl?: string | null
  logoUrl?: string | null
  primaryEmail?: string | null
  primaryPhone?: string | null
  industryClassification?: Record<string, any>
  tags?: string[]
  
  // SaaS-aware data sourcing and privacy
  dataSource: 'albaly_list' | 'dbd_registry' | 'customer_input' | 'data_enrichment' | 'third_party'
  sourceReference?: string | null
  isSharedData: boolean  // true for Albaly/DBD, false for customer-specific
  dataSensitivity: 'public' | 'standard' | 'confidential' | 'restricted'
  
  dataQualityScore: number
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'inactive'
  lastEnrichedAt?: string | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
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

// Company List entities (Schema v2.0 with SaaS multi-tenancy)
export interface CompanyList {
  id: string
  organizationId: string
  name: string
  description?: string | null
  ownerUserId: string
  visibility: 'private' | 'team' | 'organization' | 'public'
  isShared: boolean
  totalCompanies: number  // denormalized count
  lastActivityAt: string
  
  // Smart list features
  isSmartList: boolean
  smartCriteria?: Record<string, any> | null
  lastRefreshedAt?: string | null
  
  createdAt: string
  updatedAt: string
}

export interface CompanyListItem {
  itemId: string
  listId: string
  companyId: string
  note?: string | null
  position?: number | null
  customFields?: Record<string, any>  // extensible metadata
  
  // Enhanced lead scoring
  leadScore: number  // 0.0-100.0
  scoreBreakdown?: Record<string, number> | null  // detailed scoring factors
  scoreCalculatedAt?: string | null
  
  // Status tracking
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  statusChangedAt: string
  
  addedAt: string
  addedByUserId?: string | null
  company: CompanySummary
}

// Summary/aggregated views (Schema v2.0)
export interface CompanySummary {
  companyId: string
  organizationId?: string | null
  name: string
  displayName: string
  registrationNo?: string | null
  province?: string | null
  country?: string | null
  website?: string | null
  
  // Data source and privacy info
  dataSource: 'albaly_list' | 'dbd_registry' | 'customer_input' | 'data_enrichment' | 'third_party'
  sourceReference?: string | null
  isSharedData: boolean
  dataSensitivity: 'public' | 'standard' | 'confidential' | 'restricted'
  
  // Enhanced metadata
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise' | null
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'inactive'
  dataQualityScore: number
  
  headTags: Array<{
    key: string
    name: string
  }>
  classifications: Array<{
    tsic: string
    titleEn: string
  }>
  contactsCount: number
  listMembershipCount: number
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
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
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