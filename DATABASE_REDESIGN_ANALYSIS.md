# Database Schema Redesign Analysis & User Journey Optimization

## Executive Summary

This document analyzes the current Selly Base B2B prospecting platform to identify user journey pain points and proposes a comprehensive database schema redesign optimized for scalability, performance, and user experience.

## Current State Analysis

### User Journey Pain Points Identified

#### 1. **Company Data Inconsistency**
- **Pain Point**: Multiple tables (`common_company_lists`, proposed `user_company_lists`) create data duplication
- **Impact**: Confusion about which table is the canonical source of truth
- **User Impact**: Inconsistent search results, potential data loss during synchronization

#### 2. **Complex Foreign Key Relationships**
- **Pain Point**: Foreign keys not properly aligned across schema (e.g., references to both `common_company_lists` and `common_companies`)
- **Impact**: Data integrity issues, complex joins, poor query performance
- **User Impact**: Slow search results, inconsistent company data

#### 3. **Fragmented Lead Management**
- **Pain Point**: Lead listing projects separate from core company management
- **Impact**: Users must navigate multiple systems for complete lead lifecycle
- **User Impact**: Reduced efficiency, incomplete lead tracking

#### 4. **Inefficient Search & Filtering**
- **Pain Point**: Text search relies on trigram indexes without semantic understanding
- **Impact**: Poor search relevance, missed matching opportunities
- **User Impact**: Frustration finding relevant companies, incomplete prospect lists

#### 5. **Limited Multi-Tenancy Support**
- **Pain Point**: Current schema mixes single-tenant and multi-tenant concepts
- **Impact**: Difficult to scale for multiple organizations
- **User Impact**: Data isolation concerns, limited collaboration features

### Current Schema Issues

#### Table Naming Inconsistencies
```sql
-- Mixed naming patterns
common_company_lists        -- Uses "common_" prefix
user_company_lists         -- Uses "user_" prefix  
lead_listing_projects      -- Uses descriptive naming
ref_registration_types     -- Uses "ref_" prefix
```

#### Foreign Key Alignment Issues
```sql
-- Inconsistent references
common_company_contacts.company_list_id → common_company_lists.id
user_company_list_items.company_id → common_companies.id (table doesn't exist)
lead_listing_project_companies.company_list_id → common_company_lists.id
```

#### Performance Bottlenecks
- No proper indexing strategy for multi-tenant queries
- Missing composite indexes for complex filtering
- Inefficient normalization causing excessive joins
- No caching layer design considerations

## User Journey Analysis

### Primary User Flows

#### 1. **Prospect Discovery Flow**
**Current Journey**:
1. User searches in lookup page
2. Filters results using basic criteria
3. Views company details in drawer
4. Adds companies to lists manually

**Pain Points**:
- Search results not ranked by relevance
- No saved search functionality
- Manual list management is tedious
- No lead scoring during discovery

#### 2. **List Management Flow**
**Current Journey**:
1. User navigates to lists page
2. Selects existing list or creates new
3. Applies smart filtering to rank companies
4. Manually reviews and exports results

**Pain Points**:
- Smart filtering is separate from discovery
- No automatic list updates based on criteria
- Lead scores not persistent
- Limited collaboration on lists

#### 3. **Lead Qualification Flow**
**Current Journey**:
1. Staff reviews companies in staff dashboard
2. Manually approves/rejects entries
3. Bulk operations on selected companies
4. Export for further processing

**Pain Points**:
- No automated qualification rules
- Manual process doesn't scale
- Limited audit trail
- No integration with CRM systems

## Proposed Schema Redesign

### Design Principles

1. **Single Source of Truth**: One canonical company entity
2. **Consistent Naming**: Standardized table and column naming
3. **Multi-Tenant Ready**: Organization-aware design from ground up
4. **Performance Optimized**: Strategic indexing and denormalization
5. **Audit Trail**: Complete change history for compliance
6. **Scalable Architecture**: Support for millions of companies and users

### Core Entity Relationships

```
organizations (1) → (N) users
organizations (1) → (N) company_lists  
organizations (1) → (N) lead_projects

companies (1) → (N) company_contacts
companies (1) → (N) company_registrations
companies (1) → (N) company_classifications
companies (1) → (N) company_tags_assignments
companies (1) → (N) company_audit_logs

company_lists (1) → (N) company_list_items
users (1) → (N) company_lists (owner)
users (1) → (N) company_list_items (added_by)

lead_projects (1) → (N) lead_project_companies
lead_projects (1) → (N) lead_tasks
lead_tasks (1) → (N) lead_task_assignments
```

### Key Schema Improvements

#### 1. **Unified Company Entity**
- Single `companies` table as canonical source
- Proper UUID primary keys throughout
- Optimized for search and filtering

#### 2. **Multi-Tenant Architecture**
- `organizations` table for tenant isolation
- All user data scoped to organization
- Shared reference data across tenants

#### 3. **Enhanced Performance**
- Strategic composite indexes
- Materialized views for complex queries
- Denormalized search columns
- Full-text search optimization

#### 4. **Comprehensive Audit Trail**
- All changes tracked in audit tables
- User attribution for all modifications
- Tombstone records for soft deletes

#### 5. **Advanced Search Capabilities**
- Vector embeddings for semantic search
- Faceted search support
- Saved search functionality
- Real-time search suggestions

## Next Steps

1. **Create Optimized Schema**: New SQL file with comprehensive schema
2. **Migration Strategy**: Safe migration path from current schema
3. **Performance Testing**: Benchmark new schema with realistic data volumes
4. **API Updates**: Align API endpoints with new schema structure
5. **Frontend Updates**: Update components to work with new data structure

## Expected Outcomes

### User Experience Improvements
- **50% faster search results** through optimized indexing
- **Unified interface** for all company data management
- **Intelligent lead scoring** integrated throughout the application
- **Collaborative features** with proper multi-tenancy

### Technical Improvements
- **Consistent foreign key relationships** across all tables
- **Scalable architecture** supporting millions of records
- **Simplified codebase** with single source of truth
- **Better performance** through strategic denormalization

### Business Value
- **Increased user productivity** through better UX flows
- **Reduced support burden** from consistent data model
- **Enhanced scalability** for growth
- **Better compliance** through comprehensive audit trails