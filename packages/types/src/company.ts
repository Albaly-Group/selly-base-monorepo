// Company and business entities types

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
  postalCode?: string | null
  primaryIndustryId?: string | null
  primaryRegionId?: string | null
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
  isSharedData: boolean
  dataSensitivity: 'public' | 'standard' | 'confidential' | 'restricted'
  
  dataQualityScore: number
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'inactive'
  lastEnrichedAt?: string | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
}

export interface Company extends CompanyCore {
  contacts?: ContactPerson[]
  lists?: CompanyListMembership[]
  leadScore?: LeadScore
}

export interface ContactPerson {
  id: string
  companyId: string
  name: string
  email?: string | null
  phone?: string | null
  position?: string | null
  department?: string | null
  linkedinUrl?: string | null
  isVerified: boolean
  isPrimary: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CompanyList {
  id: string
  organization_id: string
  name: string
  description?: string | null
  tags: string[]
  isSmartList: boolean
  smartCriteria?: Record<string, any> | null
  visibility: 'private' | 'team' | 'organization'
  isArchived: boolean
  companyCount: number
  lastUpdated: string
  createdBy: string
  createdAt: string
  updatedAt: string
  
  // Calculated fields
  companies?: CompanySummary[]
  smartListStatus?: {
    lastRefreshAt?: string | null
    nextRefreshAt?: string | null
    refreshFrequency?: 'hourly' | 'daily' | 'weekly' | 'manual'
    isAutoRefreshEnabled: boolean
  }
}

export interface CompanyListMembership {
  id: string
  listId: string
  companyId: string
  notes?: string | null
  tags?: string[]
  addedBy: string
  addedAt: string
  
  // Virtual fields for display
  listName?: string
  addedByName?: string
}

export interface CompanySummary {
  id: string
  organization_id?: string | null
  displayName: string
  registrationId?: string | null
  addressLine1?: string | null
  provinceDetected?: string | null
  websiteUrl?: string | null
  primaryEmail?: string | null
  primaryPhone?: string | null
  companySize?: string | null
  dataSource: string
  isSharedData: boolean
  dataSensitivity: string
  dataQualityScore: number
  verificationStatus: string
  createdAt: string
  updatedAt: string
  
  // Related data for list views
  primaryContactName?: string | null
  primaryContactEmail?: string | null
  leadScore?: LeadScore | null
  listMembership?: CompanyListMembership | null
}

export interface LeadScore {
  companyId: string
  overallScore: number
  components: {
    companySize: number
    industryMatch: number
    engagement: number
    dataQuality: number
    recentActivity: number
  }
  recommendation: 'hot_lead' | 'warm_prospect' | 'cold_lead' | 'not_qualified'
  lastCalculatedAt: string
  factors: string[]
}

// Filter and search types
export interface FilterOptions {
  primaryIndustryId?: string
  primaryRegionId?: string
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  contactStatus?: "Active" | "Needs Verification" | "Invalid"
  dataSensitivity?: 'public' | 'standard' | 'confidential' | 'restricted'
  dataSource?: 'albaly_list' | 'dbd_registry' | 'customer_input' | 'data_enrichment' | 'third_party'
  verificationStatus?: 'verified' | 'unverified' | 'disputed' | 'inactive'
  leadScore?: {
    min?: number
    max?: number
    recommendation?: 'hot_lead' | 'warm_prospect' | 'cold_lead' | 'not_qualified'
  }
}

export interface SearchFilters extends FilterOptions {
  searchTerm?: string
  includeSharedData?: boolean
}

export interface SearchResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: SearchFilters
  metadata?: {
    searchTime: number
    dataSourceBreakdown: Record<string, number>
    qualityScoreDistribution: Record<string, number>
  }
}

// API Request/Response types
export interface CompanyCreateRequest {
  companyNameEn: string
  companyNameTh?: string
  displayName?: string
  registrationId?: string
  addressLine1?: string
  provinceDetected?: string
  businessDescription?: string
  websiteUrl?: string
  primaryEmail?: string
  primaryPhone?: string
  tags?: string[]
}

export interface CompanyUpdateRequest extends Partial<CompanyCreateRequest> {
  id: string
}

export interface CompanyListCreateRequest {
  name: string
  description?: string
  tags?: string[]
  visibility?: 'private' | 'team' | 'organization'
  isSmartList?: boolean
  smartCriteria?: Record<string, any>
}

export interface CompanyListUpdateRequest extends Partial<CompanyListCreateRequest> {
  id: string
}

export interface BulkOperation {
  operation: 'add' | 'remove' | 'update' | 'tag' | 'export'
  companyIds: string[]
  listId?: string
  tags?: string[]
  notes?: string
  exportFormat?: 'csv' | 'xlsx' | 'json'
}

export interface ExportData {
  companies: CompanySummary[]
  exportedAt: string
  exportedBy: string
  filters?: SearchFilters
  metadata?: {
    totalRecords: number
    format: 'csv' | 'xlsx' | 'json'
    columns: string[]
  }
}