# Permission-Based Access Control Migration

## Overview

This document summarizes the migration from role-based checks to permission-based access control in the Selly Base frontend application. This change ensures consistency between frontend, backend, and database implementations of RBAC (Role-Based Access Control).

## Problem Statement

The frontend application was using direct role checks (`user.role === "staff"`) which created inconsistencies with the backend RBAC system that uses a proper permissions model with `users`, `roles`, and `permissions` tables. This inconsistency could lead to:

1. **Access control bugs**: Different behavior between frontend and backend
2. **Maintenance issues**: Role logic duplicated across components
3. **Limited flexibility**: Couldn't support users with multiple roles
4. **Future limitations**: Hard to implement granular permissions

## Solution

Migrated from direct role checks to permission-based helper functions that:

1. Check both the legacy `role` field and the new `roles` array
2. Centralize permission logic in reusable functions
3. Align with backend RBAC implementation
4. Support future permission-based features

## Changes Made

### 1. New Helper Functions Added (`apps/web/lib/auth.tsx`)

#### Role Check Functions
- `isStaff(user: User): boolean` - Checks if user has staff role

#### Permission Check Functions
- `canManageDatabase(user: User): boolean` - Staff, customer admin, or legacy admin can manage database
- `canViewReports(user: User): boolean` - Staff, customer admin, or legacy admin can view reports

### 2. Updated Components

#### `apps/web/components/navigation.tsx`
**Before:**
```typescript
{(user.role === "staff" || isCustomerAdmin(user) || isLegacyAdmin(user)) && !isPlatformAdmin(user) && (
  <>
    <NavigationMenuItem>Database Management</NavigationMenuItem>
    <NavigationMenuItem>Reports</NavigationMenuItem>
  </>
)}
```

**After:**
```typescript
{canManageDatabase(user) && !isPlatformAdmin(user) && (
  <>
    <NavigationMenuItem>Database Management</NavigationMenuItem>
    <NavigationMenuItem>Reports</NavigationMenuItem>
  </>
)}
```

#### `apps/web/components/customer-dashboard.tsx`
**Before:**
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

## Migration Guide for Developers

When adding new features that require role checks:

### ❌ Don't do this:
```typescript
{user.role === "staff" && <StaffFeature />}
{user.role === "admin" && <AdminFeature />}
```

### ✅ Do this instead:
```typescript
// Use existing permission functions
{canManageDatabase(user) && <StaffFeature />}
{canManageOrganizationUsers(user) && <AdminFeature />}

// Or create new permission functions
export function canAccessNewFeature(user: User): boolean {
  return isStaff(user) || isCustomerAdmin(user)
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
