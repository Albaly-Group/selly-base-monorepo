# Multi-Tenant Platform Admin Permission Specification

## Overview

This document defines the comprehensive permission system for the Selly Base multi-tenant platform, detailing what each role can access and the user journey goals for each role.

## Full RBAC Permission System

### Core Permission Function

The system now uses a pure RBAC approach with the core `hasPermission()` function:

```typescript
hasPermission(user: User, permissionKey: string): boolean
```

This function:
- Checks all roles assigned to the user
- Supports wildcard permissions (`*` for full access)
- Supports pattern matching (e.g., `tenants:*` matches all tenant operations)
- Provides consistent permission checking across the application

### Permission Keys

**Platform Admin Permissions:**
- `*` - Wildcard (full access to everything)
- `tenants:manage` - Manage customer organizations
- `users:manage` - Manage platform users
- `analytics:view` - View platform analytics
- `settings:manage` - Manage platform settings
- `shared-data:manage` - Manage shared data

**Organization Admin Permissions:**
- `org-users:manage` - Manage organization users
- `org-policies:manage` - Manage organization policies
- `org-data:manage` - Manage organization data
- `org-settings:manage` - Manage organization settings

**Staff Permissions:**
- `database:manage` - Manage company database
- `reports:view` - View reports

**User Permissions:**
- `companies:read` - Search companies
- `lists:manage` - Manage lists
- `data:import` - Import data
- `data:export` - Export data

### Permission Helper Functions

All helper functions now use `hasPermission()` internally:

```typescript
// Platform Admin
export function canManageTenants(user: User): boolean {
  return hasPermission(user, 'tenants:manage') || hasPermission(user, '*')
}

// Organization Admin
export function canManageOrganizationUsers(user: User): boolean {
  return hasPermission(user, 'org-users:manage') || hasPermission(user, '*')
}

// Staff
export function canManageDatabase(user: User): boolean {
  return hasPermission(user, 'database:manage') || hasPermission(user, '*')
}
```

**Example Usage:**
```typescript
// ✅ RBAC Standard approach
{hasPermission(user, 'database:manage') && <DatabaseFeature />}
{canManageDatabase(user) && <DatabaseFeature />}
```

## Role Hierarchy

### 1. **Platform Admin** (`platform_admin`)
**Purpose**: Albaly system administrators who manage the entire platform
**Scope**: Cross-tenant, global system access
**Organization**: `null` (no specific tenant association)

### 2. **Customer Admin** (`customer_admin`) / Legacy Admin (`admin`)
**Purpose**: Customer organization administrators who manage their specific tenant
**Scope**: Single tenant/organization only
**Organization**: Specific organization ID

### 3. **Staff** (`staff`)
**Purpose**: Employee-level users within a customer organization
**Scope**: Limited access within their organization
**Organization**: Specific organization ID

### 4. **User** (`user`)
**Purpose**: Basic users within a customer organization
**Scope**: Basic features within their organization
**Organization**: Specific organization ID

## Platform Admin Feature Matrix

### ✅ **Allowed Features** (Platform Admin Only)

#### 1. Tenant Management (`/platform-admin` → Tenants Tab)
- **Permission**: `canManageTenants(user)`
- **Features**:
  - View all customer organizations
  - Create new tenant organizations
  - Edit tenant subscription tiers (basic/professional/enterprise)
  - Suspend/activate tenant accounts
  - View tenant usage metrics (users, data records)
  - Manage tenant billing and subscription status
- **User Journey Goal**: Monitor and manage all customer organizations for platform health and billing

#### 2. Platform Users Management (`/platform-admin` → Platform Users Tab)
- **Permission**: `canManagePlatformUsers(user)`
- **Features**:
  - View cross-tenant user directory
  - Filter users by role, organization, status
  - Manage user roles across organizations
  - Suspend/activate users across all tenants
  - View user activity logs and login statistics
  - Reset passwords for any user
- **User Journey Goal**: Provide comprehensive user support and security management across all tenants

#### 3. Shared Data Management (`/platform-admin` → Shared Data Tab)
- **Permission**: `canManageSharedData(user)`
- **Features**:
  - Manage shared company database (DBD warehouse data)
  - Import/export shared company data
  - Control data quality and verification status
  - Manage data availability across tenants
  - Update shared data schemas and formats
- **User Journey Goal**: Maintain high-quality shared data that benefits all tenants

#### 4. Platform Analytics (`/platform-admin` → Analytics Tab)
- **Permission**: `canViewPlatformAnalytics(user)`
- **Features**:
  - View system-wide metrics and KPIs
  - Monitor tenant usage patterns and growth
  - Track platform performance and uptime
  - Generate revenue and usage reports
  - Monitor data quality across platform
  - API usage statistics and rate limiting
- **User Journey Goal**: Make data-driven decisions for platform improvements and business growth

#### 5. Platform Settings (`/platform-admin` → Settings Tab)
- **Permission**: `canManagePlatformSettings(user)`
- **Features**:
  - Configure system-wide settings
  - Manage security policies and authentication
  - Configure integrations (DBD warehouse, backups)
  - Set platform-wide notification preferences
  - Manage API rate limits and quotas
  - System maintenance and health monitoring
- **User Journey Goal**: Maintain platform security, performance, and reliability

### ❌ **Restricted Features** (Platform Admin Should NOT Access)

#### Customer-Specific Operations
- **Individual tenant's private data** (unless for support purposes)
- **Tenant-specific list management** (customer's private lists)
- **Customer's internal user messages or communications**
- **Tenant-specific import/export operations** (unless troubleshooting)

**Rationale**: Platform admins manage the system, not individual tenant operations

## Customer Admin Feature Matrix

### ✅ **Allowed Features** (Customer Admin Only)

#### 1. Organization User Management (`/admin` → Users & Roles Tab)
- **Permission**: `canManageOrganizationUsers(user)`
- **Features**:
  - Manage users within their organization only
  - Assign roles within their tenant (user, staff, customer_admin)
  - View user activity within organization
  - Reset passwords for organization users
- **User Journey Goal**: Manage team access and roles within their organization

#### 2. Organization Policies (`/admin` → Policies Tab)
- **Permission**: `canManageOrganizationPolicies(user)`
- **Features**:
  - Set export permissions for organization
  - Configure data access policies for team
  - Manage list sharing permissions within org
  - Set import validation requirements
- **User Journey Goal**: Control data security and access within their organization

#### 3. Organization Data Management
- **Permission**: `canManageOrganizationData(user)`
- **Features**:
  - Import organization-specific data
  - Manage organization's private company lists
  - Export organization data (within policy limits)
  - Access shared data (view-only)
- **User Journey Goal**: Manage their organization's private data while accessing shared resources

#### 4. Organization Settings (`/admin` → Data Retention, Integrations Tab)
- **Permission**: `canManageOrganizationSettings(user)`
- **Features**:
  - Configure data retention policies
  - Manage organization integrations
  - Set notification preferences
  - Configure backup schedules
- **User Journey Goal**: Customize platform behavior for their organization's needs

### ❌ **Restricted Features** (Customer Admin Should NOT Access)

#### Platform-Wide Operations
- **Other organizations' data or users**
- **Shared data management** (read-only access only)
- **Platform-wide settings or policies**
- **Cross-tenant analytics or reports**
- **System-wide user management**

## Implementation Requirements

### 1. **Permission Function Structure**

```typescript
// Platform Admin Permissions
export function canManageTenants(user: User): boolean
export function canManagePlatformUsers(user: User): boolean
export function canManageSharedData(user: User): boolean
export function canViewPlatformAnalytics(user: User): boolean
export function canManagePlatformSettings(user: User): boolean

// Customer Admin Permissions
export function canManageOrganizationUsers(user: User): boolean
export function canManageOrganizationPolicies(user: User): boolean
export function canManageOrganizationData(user: User): boolean
export function canManageOrganizationSettings(user: User): boolean

// Staff Permissions
export function canManageDatabase(user: User): boolean
export function canViewReports(user: User): boolean

// Data Access Permissions
export function canAccessSharedData(user: User): boolean
export function canAccessOrganizationData(user: User, orgId: string): boolean
```

### 2. **Component Protection Pattern**

```typescript
export function ProtectedComponent() {
  const { user } = useAuth()
  
  if (!user || !requiredPermission(user)) {
    return <AccessDeniedMessage requiredPermission="permission_name" />
  }
  
  return <ActualComponent />
}
```

### 3. **Navigation Menu Logic**

```typescript
// Only show menu items if user has permission
{canManageTenants(user) && (
  <NavItem href="/platform-admin">Platform Admin</NavItem>
)}

{(isCustomerAdmin(user) || isLegacyAdmin(user)) && (
  <NavItem href="/admin">Organization Admin</NavItem>
)}
```

## User Journey Specifications

### Platform Admin Journey
1. **Login** → Platform admin dashboard
2. **Monitor System Health** → View metrics and alerts
3. **Manage Tenants** → Create, configure, monitor customer organizations
4. **Support Users** → Cross-tenant user management and support
5. **Maintain Data Quality** → Manage shared data resources
6. **Configure Platform** → System settings and integrations

### Customer Admin Journey
1. **Login** → Organization dashboard
2. **Manage Team** → Add/remove users, assign roles
3. **Configure Policies** → Set data access and export rules
4. **Import Data** → Upload organization-specific data
5. **Access Shared Resources** → View/search shared company database
6. **Generate Reports** → Organization-specific analytics and exports

### Staff/User Journey
1. **Login** → Basic dashboard
2. **Search Companies** → Access company lookup with proper filters
3. **Manage Lists** → Create and manage personal company lists
4. **Generate Exports** → Export data within policy limits
5. **View Reports** → Basic usage and list analytics

## Security Requirements

### Data Isolation
- **Tenant data must be completely isolated** except for shared resources
- **Platform admins can access cross-tenant data only for support/admin purposes**
- **Customer admins cannot access other organizations' private data**

### Permission Validation
- **Server-side validation required for all data operations**
- **Client-side permission checks for UI/UX only**
- **Audit logs for all cross-tenant operations**

### Access Control
- **Role-based access control (RBAC) with granular permissions**
- **Organization-scoped data access for non-platform roles**
- **Clear error messages for permission denials**

## Implementation Checklist

### Phase 1: Core Permissions ✅
- [x] Basic permission functions implemented
- [x] Role-based access control
- [x] Component-level permission checks

### Phase 2: Feature Refinement (Current)
- [x] Replace role-based checks with permission-based checks
- [x] Add staff permission functions (canManageDatabase, canViewReports)
- [ ] Remove/hide unauthorized features
- [ ] Comprehensive permission validation
- [ ] Improved error messages and user feedback
- [ ] Fix NextJS hydration errors

### Phase 3: Enhanced Security
- [ ] Server-side permission validation
- [ ] Audit logging for sensitive operations
- [ ] Rate limiting and security monitoring
- [ ] Comprehensive testing of permission boundaries

This specification ensures clear separation of responsibilities, maintains security, and provides optimal user experiences for each role in the multi-tenant system.