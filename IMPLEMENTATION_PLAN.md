# Database Schema Implementation Plan & Next Agent Prompt

## Current Status: Schema Design Complete ✅

The database schema redesign is **complete** with the following key features implemented:

### ✅ Completed: Database Schema v2.0
- **Multi-tenant SaaS architecture** with organization scoping
- **SaaS-aware data sourcing** with proper privacy controls
- **Performance optimizations** with strategic indexing
- **Complete audit trails** and comprehensive logging
- **Vector search support** for AI/ML features
- **Sample data** demonstrating shared vs private data isolation

### Key Schema Features Implemented:
1. **`organizations`** - Multi-tenant foundation
2. **`users`** - Organization-scoped users with RBAC
3. **`companies`** - Canonical company data with privacy controls
4. **`company_lists`** - Enhanced list management with smart features
5. **`lead_projects`** - Project-based workflow management
6. **Complete indexing strategy** for optimal performance
7. **Materialized views** for complex queries

---

## 🚀 NEXT PHASE: Application Implementation

### **Task for Next Developer/Agent:**

Implement the application layer to use the new optimized database schema v2.0. The existing frontend components and API endpoints need to be updated to work with the new SaaS-aware multi-tenant architecture.

## Implementation Priority Order

### **Phase 1: Database Connection & Core Services (HIGH PRIORITY)**

#### 1.1 Database Connection Setup
**File: `/lib/database.ts`** (CREATE NEW)
```typescript
// Implement PostgreSQL connection pool using pg or Prisma
// Support connection string from environment variables
// Include connection pooling and error handling
// Add organization context for all queries
```

**Environment Variables Needed:**
```
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_POOL_SIZE=20
```

#### 1.2 Update Type Definitions
**File: `/lib/types/company-lists.ts`** (UPDATE EXISTING)
- Add new fields from schema v2.0:
  - `organization_id` to CompanyCore
  - `data_source`, `source_reference`, `is_shared_data`, `data_sensitivity`
  - Enhanced privacy and multi-tenancy fields

**File: `/lib/types.ts`** (UPDATE EXISTING)
- Add Organization interface
- Update User interface with organization_id
- Add SaaS-specific types

#### 1.3 Database Service Layer
**File: `/lib/services/database-service.ts`** (CREATE NEW)
```typescript
// Base database service class with:
// - Organization-scoped queries
// - Transaction support
// - Audit logging integration
// - Error handling with proper typing
```

### **Phase 2: Company Data Service (HIGH PRIORITY)**

#### 2.1 Companies Service
**File: `/lib/services/companies-service.ts`** (CREATE NEW)
```typescript
class CompaniesService {
  // Search companies with SaaS privacy controls
  async searchCompanies(organizationId: string, filters: SearchFilters): Promise<SearchResult<CompanySummary>>
  
  // Get shared reference data (Albaly/DBD)
  async getSharedCompanies(filters: SearchFilters): Promise<CompanySummary[]>
  
  // Get organization-specific companies
  async getOrganizationCompanies(organizationId: string, filters: SearchFilters): Promise<CompanySummary[]>
  
  // Create customer-specific company
  async createCompany(organizationId: string, companyData: CompanyCreateRequest): Promise<CompanyCore>
  
  // Update company with audit trail
  async updateCompany(companyId: string, updates: CompanyUpdateRequest, userId: string): Promise<CompanyCore>
}
```

#### 2.2 Update Existing Company Lists Service
**File: `/lib/services/company-lists-service.ts`** (UPDATE EXISTING)
- Replace mock data with real database queries
- Add organization scoping to all operations
- Implement smart list functionality
- Add lead scoring integration

### **Phase 3: API Endpoints Update (MEDIUM PRIORITY)**

#### 3.1 Update Company Lists API
**Files: `/app/api/v1/company-lists/**/*.ts`** (UPDATE EXISTING)
- Add organization context from user authentication
- Implement proper SaaS data filtering
- Add support for smart list criteria
- Include audit logging for all operations

#### 3.2 Add Companies Search API
**File: `/app/api/v1/companies/route.ts`** (CREATE NEW)
```typescript
// GET /api/v1/companies/search - Multi-tenant company search
// POST /api/v1/companies - Create customer-specific company
// Support both shared data and organization-private data
```

#### 3.3 Add Lead Projects API
**File: `/app/api/v1/lead-projects/**/*.ts`** (CREATE NEW)
```typescript
// Full CRUD operations for lead projects
// Organization-scoped with proper access controls
// Integration with company lists and tasks
```

### **Phase 4: Frontend Components Update (MEDIUM PRIORITY)**

#### 4.1 Update Search Components
**Files: `/components/company-search.tsx`, `/components/company-table.tsx`**
- Add organization context to all API calls
- Display data source attribution ("From Albaly list", "Customer input")
- Add data sensitivity indicators
- Implement semantic search toggle

#### 4.2 Update List Management
**Files: `/components/list-*.tsx`**
- Add smart list configuration UI
- Show shared vs private data indicators
- Add collaboration features for team visibility
- Implement lead scoring visualization

#### 4.3 Add Multi-tenant Controls
**Files: `/components/organization-*.tsx`** (CREATE NEW)
- Organization switcher (if user has multiple orgs)
- Data source filtering controls
- Privacy level indicators
- Shared data browser

### **Phase 5: Authentication & Authorization (HIGH PRIORITY)**

#### 5.1 Update Authentication System
**File: `/lib/auth.tsx`** (UPDATE EXISTING)
- Add organization context to user session
- Support multiple organization memberships
- Implement RBAC with new permission system

#### 5.2 Add Organization Management
**Files: `/app/settings/organization/page.tsx`** (CREATE NEW)
- Organization profile management
- User invitation and role management
- Data retention policies
- Subscription tier controls

### **Phase 6: Advanced Features (LOW PRIORITY)**

#### 6.1 Smart Lists Implementation
- Auto-updating list criteria engine
- Background job system for list refresh
- Smart notification system

#### 6.2 Lead Projects Workflow
- Complete project management interface
- Task assignment and tracking
- Progress dashboards and reporting

#### 6.3 Semantic Search
- Vector search implementation
- AI-powered company recommendations
- Search suggestion system

---

## 🔧 Technical Implementation Guidelines

### Database Best Practices
1. **Always include organization context** in queries where applicable
2. **Use prepared statements** to prevent SQL injection
3. **Implement proper transaction handling** for multi-table operations
4. **Add comprehensive error handling** with proper error types
5. **Include audit logging** for all data modifications

### SaaS Privacy Guidelines
1. **Never show customer-specific data** to other organizations
2. **Always validate organization ownership** before data access
3. **Implement proper data sensitivity controls**
4. **Use clear data source attribution** in UI
5. **Respect data visibility settings** (private, team, org, public)

### Performance Considerations
1. **Use the materialized view** (`mv_company_search`) for search operations
2. **Implement proper pagination** for large result sets
3. **Use database indexes effectively** for complex filters
4. **Consider caching strategies** for frequently accessed data
5. **Monitor query performance** and optimize as needed

### Testing Requirements
1. **Multi-tenancy isolation testing** - ensure no data leakage
2. **Performance testing** with realistic data volumes
3. **API endpoint testing** with proper error scenarios
4. **Frontend component testing** with mock API responses
5. **End-to-end testing** of complete user workflows

---

## 📋 Implementation Checklist

### Phase 1: Foundation ⏳
- [ ] Set up PostgreSQL connection with pooling
- [ ] Update TypeScript interfaces for schema v2.0
- [ ] Create base database service layer
- [ ] Add environment variable configuration
- [ ] Test database connectivity and basic queries

### Phase 2: Core Services ⏳
- [ ] Implement CompaniesService with SaaS controls
- [ ] Update CompanyListsService to use real database
- [ ] Add comprehensive error handling
- [ ] Implement audit logging integration
- [ ] Add unit tests for service layer

### Phase 3: API Layer ⏳
- [ ] Update existing company-lists API endpoints
- [ ] Create new companies search API
- [ ] Add lead projects API endpoints
- [ ] Implement proper authentication middleware
- [ ] Add API documentation and testing

### Phase 4: Frontend ⏳
- [ ] Update search and filter components
- [ ] Add multi-tenant UI controls
- [ ] Implement data source indicators
- [ ] Update list management interface
- [ ] Add organization management pages

### Phase 5: Integration ⏳
- [ ] End-to-end testing of updated workflows
- [ ] Performance optimization and monitoring
- [ ] Security testing and validation
- [ ] User acceptance testing
- [ ] Documentation updates

---

## 🚨 Critical Requirements

### Security & Privacy
- **MANDATORY**: All queries must include organization scoping where applicable
- **MANDATORY**: Validate user access rights before any data operations
- **MANDATORY**: Never expose customer-private data to other organizations
- **MANDATORY**: Implement proper audit trails for compliance

### Performance
- **TARGET**: < 50ms response time for company search queries
- **TARGET**: < 100ms response time for list operations
- **TARGET**: Support 1000+ concurrent users
- **TARGET**: 99.9% API uptime

### Data Quality
- **ENSURE**: Consistent data source attribution throughout UI
- **ENSURE**: Proper validation of all user inputs
- **ENSURE**: Graceful handling of missing or invalid data
- **ENSURE**: Clear error messages for users

---

## 📞 Support & Resources

### Schema Reference
- **Primary Schema**: `/selly-base-optimized-schema.sql`
- **Migration Guide**: `/SCHEMA_MIGRATION_GUIDE.md`
- **Compatibility Analysis**: `/SCHEMA_COMPATIBILITY_ANALYSIS.md`

### Architecture Documents
- **User Journey Analysis**: `/USER_JOURNEY_OPTIMIZATION.md`
- **Database Analysis**: `/DATABASE_REDESIGN_ANALYSIS.md`
- **Project Summary**: `/PROJECT_SUMMARY.md`

### Key Schema Tables
1. **`organizations`** - Multi-tenant foundation
2. **`users`** - Organization-scoped users
3. **`companies`** - Main company data with privacy controls
4. **`company_lists`** - User-created collections
5. **`lead_projects`** - Project workflow management
6. **`audit_logs`** - Comprehensive change tracking

---

## 🎯 Success Criteria

The implementation will be considered successful when:

1. **Multi-tenant data isolation** is working perfectly (no data leakage between organizations)
2. **Performance targets** are met (< 50ms search, < 100ms lists)
3. **All existing frontend functionality** works with the new database
4. **Data source attribution** is clear throughout the UI
5. **SaaS privacy controls** are properly enforced
6. **Audit trails** are complete and accessible
7. **Smart list functionality** is operational
8. **Lead project workflows** are fully implemented

---

**Next Agent: Begin with Phase 1 (Database Connection & Core Services) and work through the checklist systematically. Each phase builds on the previous one, so maintain the order for best results.**

**Estimated Timeline: 6-8 weeks for complete implementation**

**Priority: HIGH - This is the foundation for the entire SaaS platform upgrade**