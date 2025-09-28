# Schema Compatibility Analysis

## TypeScript Interface Compatibility

### Existing Types Analysis
The current TypeScript interfaces in `lib/types/company-lists.ts` are well-structured and mostly compatible with the new schema v2.0:

#### ✅ Compatible Types
- `CompanyCore` interface aligns with new `companies` table
- `CompanyList` interface maps to new `company_lists` table  
- `CompanyListItem` interface corresponds to `company_list_items` table
- Basic CRUD operation types remain valid

#### 🔄 Types Requiring Updates

**CompanyCore Interface Updates:**
```typescript
// Current
interface CompanyCore {
  companyNameEn: string
  companyNameTh?: string | null
  registrationId?: string | null
  // ... other fields
}

// Schema v2.0 Enhanced
interface CompanyCore {
  nameEn: string                    // renamed from companyNameEn
  nameTh?: string | null           // renamed from companyNameTh  
  nameLocal?: string | null        // new field for international companies
  displayName: string              // computed field
  primaryRegistrationNo?: string   // renamed from registrationId
  dataQualityScore: number         // new field
  embeddingVector?: number[]       // new AI/ML field
  verificationStatus: string       // new field
  // ... enhanced location fields
}
```

**CompanyList Interface Updates:**
```typescript
// Schema v2.0 Enhanced
interface CompanyList {
  id: string
  organizationId: string           // new multi-tenant field
  ownerUserId: string
  name: string
  description?: string | null
  visibility: 'private' | 'team' | 'organization' | 'public' // expanded options
  isShared: boolean
  isSmartList: boolean             // new field for auto-updating lists
  smartCriteria?: object           // new field for smart list rules
  totalCompanies: number           // denormalized count
  lastActivityAt: string           // new field
  createdAt: string
  updatedAt: string
}
```

**CompanyListItem Interface Updates:**
```typescript
// Schema v2.0 Enhanced  
interface CompanyListItem {
  itemId: string
  listId: string
  companyId: string
  note?: string | null
  position?: number | null
  customFields?: Record<string, any>  // new extensible field
  leadScore: number                   // new scoring field
  scoreBreakdown?: Record<string, number> // new detailed scoring
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected' // new status
  statusChangedAt: string             // new field
  addedAt: string
  addedByUserId?: string | null
  company: CompanySummary
}
```

### New Types Required

#### Multi-Tenant Types
```typescript
interface Organization {
  id: string
  name: string
  slug: string
  domain?: string | null
  status: 'active' | 'inactive' | 'suspended'
  subscriptionTier: 'basic' | 'professional' | 'enterprise'
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  organizationId: string           // multi-tenant scoping
  email: string
  name: string
  // ... other fields enhanced for multi-tenancy
}
```

#### Lead Project Types (New)
```typescript
interface LeadProject {
  id: string
  organizationId: string
  name: string
  description?: string | null
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  ownerUserId?: string | null
  pmUserId?: string | null
  teamLeadUserId?: string | null
  targetCompanyCount?: number | null
  actualMetrics: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface LeadProjectCompany {
  id: string
  projectId: string
  companyId: string
  sourceMethod: 'manual' | 'import' | 'smart_list' | 'api'
  priorityScore: number
  status: 'pending' | 'assigned' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  assignedToUserId?: string | null
  notes?: string | null
  customFields: Record<string, any>
  addedAt: string
}
```

#### Enhanced Search Types
```typescript
interface SearchOptions {
  query?: string
  useSemanticSearch?: boolean      // new AI-powered search
  organizationId: string           // multi-tenant scoping
  filters?: {
    province?: string
    companySize?: string[]
    tags?: string[]
    industryClassification?: string[]
    verificationStatus?: string
    dataQualityMinimum?: number
  }
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
}

interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
  searchMetadata?: {
    queryTime: number
    relevanceScore?: number
    suggestedRefinements?: string[]
  }
}
```

### API Response Type Updates

#### Enhanced Company Search Response
```typescript
interface CompanySearchResponse {
  companies: CompanySummary[]
  aggregations: {
    provinces: { key: string; count: number }[]
    companySizes: { key: string; count: number }[]
    industries: { key: string; count: number }[]
    tags: { key: string; count: number }[]
  }
  suggestions?: string[]
  searchMetadata: {
    totalResults: number
    queryTimeMs: number
    usedSemanticSearch: boolean
  }
}
```

## Frontend Component Impact Analysis

### Components Requiring Updates

#### 1. Search Components (`components/company-search.tsx`)
**Required Changes:**
- Add organization context to all queries
- Implement semantic search toggle
- Add faceted filtering UI
- Update result rendering for enhanced data

#### 2. List Management (`components/list-*.tsx`)  
**Required Changes:**
- Add smart list configuration UI
- Implement collaboration features
- Add lead scoring visualization
- Update for multi-tenant scoping

#### 3. Company Detail Drawer (`components/company-detail-drawer.tsx`)
**Required Changes:**
- Display enhanced company data (verification, quality score)
- Show audit trail information
- Add lead scoring details
- Multi-registration support

### Database Service Layer Updates

#### Updated Service Methods
```typescript
// Enhanced company search service
async function searchCompanies(
  organizationId: string, 
  options: SearchOptions
): Promise<SearchResult<CompanySummary>> {
  // Implementation uses materialized view mv_company_search
  // Supports both text and vector search
  // Returns aggregated facets for filtering
}

// Smart list management service
async function createSmartList(
  organizationId: string,
  userId: string,
  config: SmartListConfig
): Promise<CompanyList> {
  // Creates auto-updating list based on criteria
  // Sets up refresh schedule
  // Configures collaboration permissions
}

// Lead scoring service
async function calculateLeadScore(
  companyId: string,
  criteria: ScoringCriteria,
  organizationContext: OrganizationContext
): Promise<LeadScore> {
  // Multi-factor scoring algorithm
  // ML model integration
  // Contextual scoring based on organization
}
```

## Migration Impact Summary

### Low Risk Changes ✅
- Basic CRUD operations remain similar
- Core entity relationships preserved
- Existing API patterns can be enhanced incrementally

### Medium Risk Changes 🔄  
- Multi-tenant scoping requires organization context
- Enhanced data fields need UI updates
- Search functionality gets significant improvements

### High Impact Changes ⚠️
- Smart lists require new UI components
- Lead projects introduce entirely new workflows  
- Vector search needs new infrastructure

### Recommended Approach
1. **Phase 1**: Migrate schema and basic operations
2. **Phase 2**: Enhance existing features (search, lists)
3. **Phase 3**: Add new features (smart lists, lead projects)
4. **Phase 4**: Advanced features (ML scoring, semantic search)