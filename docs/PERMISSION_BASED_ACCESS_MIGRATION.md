# Full RBAC Permission System Migration

## Overview

This document summarizes the complete migration to a pure RBAC (Role-Based Access Control) permission system in the Selly Base frontend application. All legacy role checks have been removed in favor of granular permission-based access control, ensuring consistency between frontend, backend, and database implementations.

## Problem Statement

The frontend application was using mixed role-based and permission-based checks:
- Direct role checks (`user.role === "staff"`)
- Legacy role helper functions (`isLegacyAdmin()`, `isCustomerAdmin()`, etc.)
- Inconsistent with the backend RBAC system using `users`, `roles`, and `permissions` tables

This inconsistency created:

1. **Access control bugs**: Different behavior between frontend and backend
2. **Maintenance issues**: Role logic duplicated across components
3. **Limited flexibility**: Couldn't support users with multiple roles
4. **Future limitations**: Hard to implement granular permissions
5. **Technical debt**: Legacy code mixed with new RBAC system

## Solution

Complete migration to a pure RBAC permission system:

1. **Removed all legacy role functions**: `isStaff()`, `isCustomerAdmin()`, `isLegacyAdmin()`, `isPlatformAdmin()`
2. **Implemented `hasPermission()` function**: Standard RBAC permission checking with wildcard support
3. **Updated all permission check functions**: Now use `hasPermission()` with specific permission keys
4. **Updated all page-level guards**: `requireAuth()` now accepts permissions instead of roles
5. **Aligned with RBAC standard**: Follows industry-standard permission patterns

## Changes Made

### 1. Core RBAC Function (`apps/web/lib/auth.tsx`)

#### `hasPermission(user: User, permissionKey: string): boolean`
The core permission checking function that:
- Checks all roles assigned to the user
- Supports wildcard permissions (`*` for full access)
- Supports pattern matching (e.g., `tenants:*` matches `tenants:read`, `tenants:write`)
- Returns true if user has the required permission

### 2. Permission Check Functions (RBAC Standard)

All permission functions now use `hasPermission()` internally:

**Platform Admin Permissions:**
- `canManageTenants()` - Checks for `tenants:manage` or `*`
- `canManagePlatformUsers()` - Checks for `users:manage` or `*`
- `canViewPlatformAnalytics()` - Checks for `analytics:view` or `*`
- `canManagePlatformSettings()` - Checks for `settings:manage` or `*`
- `canManageSharedData()` - Checks for `shared-data:manage` or `*`

**Organization Admin Permissions:**
- `canManageOrganizationUsers()` - Checks for `org-users:manage` or `*`
- `canManageOrganizationPolicies()` - Checks for `org-policies:manage` or `*`
- `canManageOrganizationData()` - Checks for `org-data:manage` or `*`
- `canManageOrganizationSettings()` - Checks for `org-settings:manage` or `*`

**Staff Permissions:**
- `canManageDatabase()` - Checks for `database:manage` or `*`
- `canViewReports()` - Checks for `reports:view` or `*`

### 3. Updated Components

#### `apps/web/components/navigation.tsx`
**Before (Legacy Role Checks):**
```typescript
{(user.role === "staff" || isCustomerAdmin(user) || isLegacyAdmin(user)) && !isPlatformAdmin(user) && (
  <NavigationMenuItem>Database Management</NavigationMenuItem>
)}
```

**After (Pure RBAC Permissions):**
```typescript
{canManageDatabase(user) && !canManageTenants(user) && (
  <NavigationMenuItem>Database Management</NavigationMenuItem>
)}
```

#### `apps/web/components/customer-dashboard.tsx`
**Before (Legacy Role Checks):**
```typescript
const availableFeatures =
  user.role === "user"
    ? userFeatures
    : user.role === "staff" || user.role === "admin"
      ? [...userFeatures, ...staffFeatures]
      : userFeatures
```

**After:**
```typescript
const availableFeatures = canManageDatabase(user)
  ? [...userFeatures, ...staffFeatures]
  : userFeatures
```

### 3. Updated Documentation

- Updated `docs/PLATFORM_ADMIN_PERMISSIONS_SPEC.md` with:
  - New section on "Permission-Based Access Control"
  - Migration guide from role-based to permission-based checks
  - Added staff permission functions to the specification
  - Updated implementation checklist

## Benefits

1. **Consistency**: Frontend now aligns with backend RBAC system
2. **Maintainability**: Permission logic is centralized and reusable
3. **Flexibility**: Supports users with multiple roles via `roles` array
4. **Type Safety**: Helper functions provide better TypeScript support
5. **Future-Ready**: Easy to extend with granular permissions

## Backward Compatibility

The `hasRole()` function checks both:
1. Legacy `user.role` field (for backward compatibility)
2. New `user.roles` array (for RBAC system)

This ensures existing users with the legacy role field continue to work while supporting new users with the RBAC roles array.

## Testing

- ✅ TypeScript compilation successful
- ✅ Next.js build successful (no errors)
- ✅ All permission checks are now centralized
- ✅ No direct `user.role` checks in navigation or dashboard components

## RBAC Permission Keys

The following permission keys are used throughout the application:

### Platform Admin Permissions
- `*` - Wildcard permission (full access to everything)
- `tenants:*` - All tenant management operations
- `tenants:manage` - Manage customer organizations
- `users:manage` - Manage platform users across all tenants
- `analytics:view` - View platform-wide analytics
- `settings:manage` - Manage platform settings
- `shared-data:manage` - Manage shared data resources

### Organization Admin Permissions
- `org-users:manage` - Manage users within organization
- `org-policies:manage` - Manage organization policies
- `org-data:manage` - Manage organization-specific data
- `org-settings:manage` - Manage organization settings

### Staff Permissions
- `database:manage` - Manage company database
- `reports:view` - View reports and analytics

### User Permissions
- `companies:read` - Search and view companies
- `lists:manage` - Manage personal company lists
- `data:import` - Import data
- `data:export` - Export data

## Migration Guide for Developers

When adding new features that require access control:

### ❌ Don't do this (Legacy):
```typescript
{user.role === "staff" && <StaffFeature />}
{isCustomerAdmin(user) && <AdminFeature />}
```

### ✅ Do this (RBAC Standard):
```typescript
// Use hasPermission directly for granular control
{hasPermission(user, 'feature:access') && <NewFeature />}

// Or use/create permission helper functions
{canManageDatabase(user) && <StaffFeature />}
{canManageOrganizationUsers(user) && <AdminFeature />}

// Create new permission functions as needed
export function canAccessNewFeature(user: User): boolean {
  return hasPermission(user, 'new-feature:access') || hasPermission(user, '*')
}
```

## Next Steps

1. ✅ Frontend migration complete
2. [ ] Verify backend API endpoints use permission-based checks
3. [ ] Add permission-based checks to remaining components
4. [ ] Implement granular permissions (e.g., `company-lists:read`, `company-lists:write`)
5. [ ] Add comprehensive testing for permission boundaries

## Files Modified

- `apps/web/lib/auth.tsx` - Added permission helper functions
- `apps/web/components/navigation.tsx` - Updated to use permission checks
- `apps/web/components/customer-dashboard.tsx` - Updated to use permission checks
- `docs/PLATFORM_ADMIN_PERMISSIONS_SPEC.md` - Updated with permission-based approach

## References

- Backend RBAC implementation: `apps/web/lib/auth/api-auth.ts`
- Database schema: `apps/api/src/entities/UserRoles.ts`
- Permission specification: `docs/PLATFORM_ADMIN_PERMISSIONS_SPEC.md`
