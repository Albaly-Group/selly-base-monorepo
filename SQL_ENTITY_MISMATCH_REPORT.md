# SQL Schema vs Entity Mismatch Report

**Date**: October 1, 2025  
**Issue**: Legacy entity files reference tables that don't exist in the SQL schema  
**Status**: ⚠️ REQUIRES DECISION

## Executive Summary

After creating new entity files to match the SQL schema and successfully getting the backend to run, we discovered that **legacy entity files** exist that map to database tables NOT present in the current SQL schema (`selly-base-optimized-schema.sql`).

## Tables That Exist in Entities But NOT in SQL Schema

### 1. Legacy Company Tables (`Common*` prefix)

| Entity File | Table Name | Status |
|-------------|------------|--------|
| `CommonCompanyLists.ts` | `common_company_lists` | ❌ Not in SQL |
| `CommonCompanyClassifications.ts` | `common_company_classifications` | ❌ Not in SQL |
| `CommonCompanyContacts.ts` | `common_company_contacts` | ❌ Not in SQL |
| `CommonCompanyRegistrations.ts` | `common_company_registrations` | ❌ Not in SQL |
| `CommonCompanyShareholdersNationality.ts` | `common_company_shareholders_nationality` | ❌ Not in SQL |
| `CommonCompanyTags.ts` | `common_company_tags` | ❌ Not in SQL |

**Issue**: These entities appear to be from an older schema design that used the "common_company_*" naming convention. The current SQL schema uses `companies`, `company_lists`, etc. instead.

**Potential Causes**:
1. These are from a legacy/previous version of the schema
2. These were auto-generated from an old database and never cleaned up
3. These are meant for a different environment or database

**Recommendation**: 
- **Option A**: Remove these entity files if they're truly obsolete
- **Option B**: Add these tables to the SQL schema if they're needed for legacy data migration
- **Option C**: Document as "legacy entities for reference only"

### 2. Lead Listing Tables

| Entity File | Table Name | Status |
|-------------|------------|--------|
| `LeadListingImports.ts` | `lead_listing_imports` | ❌ Not in SQL |
| `LeadListingImportRows.ts` | `lead_listing_import_rows` | ❌ Not in SQL |
| `LeadListingProjects.ts` | `lead_listing_projects` | ❌ Not in SQL |
| `LeadListingProjectCompanies.ts` | `lead_listing_project_companies` | ❌ Not in SQL |
| `LeadListingTasks.ts` | `lead_listing_tasks` | ❌ Not in SQL |
| `LeadListingTimelogs.ts` | `lead_listing_timelogs` | ❌ Not in SQL |

**Issue**: The SQL schema has `lead_projects`, `lead_project_companies`, and `lead_project_tasks` but NOT the "lead_listing_*" variants.

**Potential Mapping**:
- `lead_listing_projects` might map to → `lead_projects`
- `lead_listing_project_companies` might map to → `lead_project_companies`
- `lead_listing_tasks` might map to → `lead_project_tasks`
- `lead_listing_imports` has no SQL equivalent
- `lead_listing_import_rows` has no SQL equivalent
- `lead_listing_timelogs` has no SQL equivalent

**Recommendation**:
- **Option A**: Rename entity files to match SQL table names (`lead_projects`, etc.)
- **Option B**: Add `lead_listing_*` tables to SQL schema
- **Option C**: Remove if not needed and use `import_jobs` for imports

### 3. Other Legacy Tables

| Entity File | Table Name | Status |
|-------------|------------|--------|
| `Clients.ts` | `clients` | ❌ Not in SQL |
| `Leads.ts` | `leads` | ❌ Not in SQL |
| `Permissions.ts` | `permissions` | ❌ Not in SQL |
| `UserPermissions.ts` | `user_permissions` | ❌ Not in SQL |
| `RolePermissions.ts` | `role_permissions` | ❌ Not in SQL |

**Issue**: 
- SQL schema uses `roles.permissions` as a TEXT array, not separate permission tables
- No `clients` or `leads` tables in SQL (might be replaced by `companies` and `company_list_items`)

**Recommendation**:
- Review if permission system needs to be more granular (separate tables)
- Determine if `clients` and `leads` concepts are now part of `companies`

### 4. Reference Data Tables (Partial Match)

| Entity File | Table Name | Status |
|-------------|------------|--------|
| `RefTsic_2009.ts` | `ref_tsic_2009` | ❌ Not in SQL |
| `RefTags.ts` | `ref_tags` | ✅ In SQL |
| `RefTagCategories.ts` | `ref_tag_categories` | ❌ Not in SQL |
| `RefRegistrationTypes.ts` | `ref_registration_types` | ❌ Not in SQL |
| `RefRegistrationAuthorities.ts` | `ref_registration_authorities` | ❌ Not in SQL |

**Issue**: Only `ref_tags` exists in SQL. Others are missing.

**SQL Has But No Entity**:
- `ref_industry_codes` ✅ In SQL but no entity
- `ref_regions` ✅ In SQL but no entity

**Recommendation**:
- Add missing reference tables to SQL if needed
- Or remove entity files if not needed

## Tables That Exist in SQL But NOT in Entities

These are documented as "reserved for future expansion" in DATABASE_INTEGRATION_STATUS.md:

| SQL Table | Purpose | Current Entity |
|-----------|---------|----------------|
| `company_registrations` | Multiple registration tracking | ❌ No entity (CommonCompanyRegistrations doesn't match) |
| `company_contacts` | Contact information | ❌ No entity (CommonCompanyContacts doesn't match) |
| `lead_projects` | Lead generation projects | ❌ No entity (LeadListingProjects doesn't match) |
| `lead_project_companies` | Project-company associations | ❌ No entity |
| `lead_project_tasks` | Project tasks | ❌ No entity (LeadListingTasks doesn't match) |
| `ref_industry_codes` | Industry classifications | ❌ No entity |
| `ref_regions` | Geographic data | ❌ No entity |
| `user_activity_logs` | Activity tracking | ❌ No entity |

## Duplicate/Conflicting Entities

### User, Users, UserRole, UserRoles
- `User.ts` → `users` table ✅ Correct, used by backend
- `Users.ts` → `users` table ⚠️ Duplicate, plural form
- `UserRole.ts` → `user_roles` table ✅ Correct, used by backend
- `UserRoles.ts` → `user_roles` table ⚠️ Duplicate, plural form

**Recommendation**: Keep singular forms (User, UserRole), remove or deprecate plural forms.

### Role, Roles
- `Role.ts` → `roles` table ✅ Correct, used by backend
- `Roles.ts` → `roles` table ⚠️ Duplicate, plural form

**Recommendation**: Keep singular form (Role), remove or deprecate plural form.

## Required Actions

### Priority 1: Document Current State (DONE ✅)
- [x] Created ENTITY_ALIGNMENT_FIX.md documenting the solution
- [x] Created this report documenting mismatches
- [x] Backend is operational with new entities

### Priority 2: Stakeholder Decision Required

**Question 1**: What should we do with legacy "Common*" entities?
- [ ] Remove them (they're obsolete)
- [ ] Add `common_company_*` tables to SQL schema
- [ ] Keep for historical reference only
- [ ] These were from a different project/database

**Question 2**: What should we do with "LeadListing*" entities?
- [ ] Rename to match SQL (`lead_projects`, `lead_project_tasks`)
- [ ] Add `lead_listing_*` tables to SQL schema
- [ ] Remove and use standard `import_jobs` for imports
- [ ] These serve a different purpose than SQL tables

**Question 3**: What should we do with Permission entities?
- [ ] Keep simple (TEXT array in roles table as in SQL)
- [ ] Add full permission tables to SQL schema
- [ ] Remove permission entities

**Question 4**: What should we do with duplicate entities (Users vs User)?
- [ ] Remove plural forms (Users, Roles, UserRoles)
- [ ] Keep both for backwards compatibility
- [ ] Deprecate but don't remove

**Question 5**: Should we add missing reference data tables to SQL?
- [ ] Add `ref_tsic_2009`, `ref_tag_categories`, `ref_registration_types`, `ref_registration_authorities` to SQL
- [ ] Remove those entity files
- [ ] These reference different external databases

### Priority 3: Implementation (After Decisions)

Based on decisions above:
- [ ] Update SQL schema with required tables OR remove obsolete entities
- [ ] Update entity files to match final schema
- [ ] Update DATABASE_INTEGRATION_STATUS.md
- [ ] Create migration for any new tables
- [ ] Add integration tests

## Current Working State

**The backend is currently working** because:
1. New entity files (Company, User, Organization, etc.) match the SQL schema ✅
2. These are exported from `entities/index.ts` ✅
3. Backend modules import the correct entity names ✅
4. Legacy entities are exported but not actively used ✅

**The mismatch doesn't currently break functionality** but creates:
- Confusion about which entities to use
- Potential for importing wrong entities
- Unclear migration path
- Risk of using legacy entities by mistake

## Recommended Approach

**For SQL Schema as Source of Truth**:

1. **Keep SQL schema as-is** (it's clean and well-designed)
2. **Remove obsolete legacy entities** that don't match SQL:
   - All `Common*` entities
   - All `LeadListing*` entities (or rename to match SQL)
   - Duplicate entities (Users, Roles, UserRoles plural forms)
   - Permission entities (use TEXT array in roles)
   - Reference entities without SQL tables

3. **Add entities for SQL tables that need them**:
   - Create `CompanyRegistration.ts` → `company_registrations`
   - Create `CompanyContact.ts` → `company_contacts`
   - Create `LeadProject.ts` → `lead_projects`
   - Create `LeadProjectCompany.ts` → `lead_project_companies`
   - Create `LeadProjectTask.ts` → `lead_project_tasks`
   - (Optional) Create reference data entities if needed

4. **Update `entities/index.ts`** to only export current entities

5. **Document the cleanup** in a migration guide

## Timeline

- **Immediate**: Backend works, no urgent action needed
- **Short-term (1-2 weeks)**: Get stakeholder decision on legacy entities
- **Medium-term (2-4 weeks)**: Clean up based on decisions, update tests
- **Long-term (1-2 months)**: Create entities for future-use SQL tables as needed

## Conclusion

The backend is now operational, but we have technical debt in the form of mismatched entity files. The SQL schema is clean and well-designed. The solution is to align entities with SQL (either by removing obsolete entities or adding missing tables to SQL).

**Recommendation**: Follow the SQL schema as source of truth and remove legacy entities that don't match, unless there's a compelling reason to keep them.

---

**Document prepared by**: GitHub Copilot  
**Review required by**: Project stakeholders, Database team, Backend team
