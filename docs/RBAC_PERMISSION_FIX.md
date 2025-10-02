# RBAC Permission Detection Fix

## Problem

The application couldn't properly detect permissions from the database. Permissions were stored as `TEXT[]` arrays in the `roles` table (e.g., `ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']`), but the frontend expected `Permission[]` objects with a `key` property.

### Root Cause

1. **Database Schema**: The `roles.permissions` column stores permissions as a PostgreSQL `TEXT[]` array
2. **API Response**: The auth service was returning roles without transforming the permissions array
3. **Frontend Expectation**: The `hasPermission()` function expected `role.permissions` to be an array of objects with this structure:
   ```typescript
   {
     id: string;
     key: string;
     description?: string;
     created_at: string;
     updated_at: string;
   }
   ```

## Solution

### 1. API Layer Changes (`apps/api/src/modules/auth/auth.service.ts`)

Updated the `login` method to transform the permissions `string[]` array into `Permission[]` objects:

```typescript
// Map roles from the user entity and transform permissions string[] to Permission[]
const roles =
  user.userRoles2?.map((userRole: any) => ({
    id: userRole.role.id,
    name: userRole.role.name,
    description: userRole.role.description,
    permissions: (userRole.role.permissions || []).map((permissionKey: string, index: number) => ({
      id: `${userRole.role.id}-perm-${index}`,
      key: permissionKey,
      description: `Permission: ${permissionKey}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  })) || [];
```

Updated the `LoginResponse` interface to include the permissions structure:

```typescript
export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    organization: { ... };
    roles?: Array<{
      id: string;
      name: string;
      description?: string;
      permissions?: Array<{
        id: string;
        key: string;
        description?: string;
        created_at: string;
        updated_at: string;
      }>;
    }>;
  };
}
```

### 2. Frontend API Client Changes (`apps/web/lib/api-client.ts`)

Updated the `LoginResponse` and `User` interfaces to include permissions in role objects:

```typescript
roles?: Array<{
  id: string;
  name: string;
  description?: string;
  permissions?: Array<{
    id: string;
    key: string;
    description?: string;
    created_at: string;
    updated_at: string;
  }>;
}>;
```

### 3. Auth Context Changes (`apps/web/lib/auth.tsx`)

Updated the auth provider to pass through permissions from the API response:

```typescript
roles: apiUser.roles?.map(r => ({
  id: r.id,
  name: r.name,
  description: r.description || null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  permissions: r.permissions || [], // Added this line
})),
```

Fixed the `canAccessOrganizationData` function that was referencing a non-existent `isPlatformAdmin` function:

```typescript
export function canAccessOrganizationData(user: User, orgId?: string): boolean {
  // Platform admins with wildcard permission can access all org data
  if (hasPermission(user, '*') || hasPermission(user, 'tenants:*')) return true
  if (!orgId || !user.organization_id) return false
  return user.organization_id === orgId
}
```

## How It Works

### Permission Flow

1. **Database** (PostgreSQL):
   ```sql
   permissions TEXT[] DEFAULT ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']
   ```

2. **API Transformation** (NestJS):
   ```typescript
   // Input: ['org:*', 'users:*', 'lists:*', 'projects:*']
   // Output:
   [
     { id: 'role-123-perm-0', key: 'org:*', description: '...', ... },
     { id: 'role-123-perm-1', key: 'users:*', description: '...', ... },
     { id: 'role-123-perm-2', key: 'lists:*', description: '...', ... },
     { id: 'role-123-perm-3', key: 'projects:*', description: '...', ... }
   ]
   ```

3. **Frontend Usage** (React/TypeScript):
   ```typescript
   hasPermission(user, 'org:read')     // true (matched by org:*)
   hasPermission(user, 'users:manage') // true (matched by users:*)
   hasPermission(user, 'tenants:view') // false (no matching permission)
   ```

### Wildcard Permission Matching

The `hasPermission()` function supports three types of permission matching:

1. **Exact Match**: `permission.key === permissionKey`
   - Example: `'lists:create'` matches `'lists:create'`

2. **Wildcard Match**: `permission.key.endsWith(':*')`
   - Example: `'org:*'` matches `'org:read'`, `'org:write'`, `'org:delete'`, etc.

3. **Global Admin**: `permission.key === '*'`
   - Example: `'*'` matches any permission

## Testing

Created comprehensive tests to verify the permission system:

1. **Unit Tests**: Tested `hasPermission()` logic with various permission patterns
2. **Integration Tests**: Verified the complete flow from database to frontend

All tests passed successfully, confirming:
- Wildcard permissions work correctly (e.g., `org:*` matches `org:read`, `org:write`)
- Global wildcard (`*`) grants access to all permissions
- Users don't get unauthorized access to permissions they shouldn't have

## Impact

This fix resolves the RBAC permission detection issue, allowing:
- Customer admins with `org:*`, `users:*`, `lists:*`, `projects:*` to access organization features
- Platform admins with `*` to access all system features
- Customer staff with specific permissions to access only their allowed features
- Proper permission checking throughout the application

## Files Modified

- `apps/api/src/modules/auth/auth.service.ts` - Added permission transformation
- `apps/web/lib/api-client.ts` - Updated type definitions
- `apps/web/lib/auth.tsx` - Added permissions passthrough and fixed `isPlatformAdmin` reference

## Related Documentation

- [PERMISSION_BASED_ACCESS_MIGRATION.md](./PERMISSION_BASED_ACCESS_MIGRATION.md) - Full RBAC migration documentation
- Database schema: `selly-base-optimized-schema.sql` - Role permissions structure
