# Platform Admin CRUD Operations Implementation

## Overview

This document describes the complete CRUD (Create, Read, Update, Delete) operations implementation for the Platform Admin feature.

## Backend Implementation

### DTOs (Data Transfer Objects)

Located in: `apps/api/src/dtos/platform-admin.dto.ts`

**Tenant DTOs:**
- `CreateTenantDto` - For creating new tenant organizations with optional admin user
- `UpdateTenantDto` - For updating tenant properties (name, domain, status, subscription tier)

**User DTOs:**
- `CreatePlatformUserDto` - For creating new platform users
- `UpdatePlatformUserDto` - For updating user properties (name, status, role)

**Shared Company DTOs:**
- `UpdateSharedCompanyDto` - For updating shared company properties

### Controller Endpoints

Located in: `apps/api/src/modules/platform-admin/platform-admin.controller.ts`

#### Tenant Endpoints
- `POST /api/v1/platform-admin/tenants` - Create new tenant
  - Can optionally create admin user with credentials
  - Returns created tenant data
  
- `PUT/PATCH /api/v1/platform-admin/tenants/:id` - Update tenant
  - Accepts both PUT and PATCH methods
  - Updates name, domain, status, or subscription tier
  
- `DELETE /api/v1/platform-admin/tenants/:id` - Deactivate tenant
  - Soft delete (sets status to 'inactive')
  - Does not remove data from database

#### User Endpoints
- `POST /api/v1/platform-admin/users` - Create new platform user
  - Requires organization ID
  - Optionally assigns role
  - Password is hashed using argon2
  
- `PUT/PATCH /api/v1/platform-admin/users/:id` - Update user
  - Updates name, status, avatar URL, or role
  - Role update removes old roles and assigns new one
  
- `DELETE /api/v1/platform-admin/users/:id` - Deactivate user
  - Soft delete (sets status to 'inactive')

#### Shared Company Endpoints
- `PUT/PATCH /api/v1/platform-admin/shared-companies/:id` - Update shared company
  - Updates isSharedData flag or verification status

### Service Layer

Located in: `apps/api/src/modules/platform-admin/platform-admin.service.ts`

**Features:**
- Uses TypeORM repositories for database access
- Password hashing with argon2
- Proper error handling with specific exceptions
- Transaction support for multi-step operations (e.g., creating tenant with admin)
- Automatic role assignment for new users
- Soft delete implementation

## Frontend Implementation

### API Client

Located in: `apps/web/lib/api-client.ts`

New methods added:
- `createTenant(data)` - POST request to create tenant
- `updateTenant(id, data)` - PUT request to update tenant
- `deleteTenant(id)` - DELETE request to deactivate tenant
- `createPlatformUser(data)` - POST request to create user
- `updatePlatformUser(id, data)` - PUT request to update user
- `deletePlatformUser(id)` - DELETE request to deactivate user
- `updateSharedCompany(id, data)` - PUT request to update company

### Data Layer

Located in: `apps/web/lib/platform-admin-data.ts`

**CRUD Functions:**
- `createTenant(data)` - Wrapper with error handling and cache invalidation
- `updateTenant(id, data)` - Wrapper with error handling and cache invalidation
- `deleteTenant(id)` - Wrapper with error handling and cache invalidation
- `createPlatformUser(data)` - Wrapper with error handling and cache invalidation
- `updatePlatformUser(id, data)` - Wrapper with error handling and cache invalidation
- `deletePlatformUser(id)` - Wrapper with error handling and cache invalidation

All functions return `{ success: boolean, data?: any, error?: string }` for consistent error handling.

### UI Components

#### Tenant Management Tab

Located in: `apps/web/components/platform-admin/tenant-management-tab.tsx`

**Features:**
- Create tenant dialog with form validation
  - Required: name, slug
  - Optional: domain, subscription tier, admin credentials
  - Slug auto-formatting to URL-friendly format
- Edit tenant dialog
  - Updates name, domain, status, subscription tier
- Toggle status action (active/inactive)
- Delete action with confirmation
- Real-time data refresh after operations
- Toast notifications for success/error states

**Form State Management:**
- Uses React state for form data
- Validation before submission
- Loading states during API calls
- Error handling with user-friendly messages

#### Platform Users Tab

Located in: `apps/web/components/platform-admin/platform-users-tab.tsx`

**Features:**
- Create user dialog
  - Required: name, email, password, organization
  - Optional: status
  - Organization dropdown populated from tenants
- Edit user dialog
  - Updates name, status
  - Email shown as read-only
- Deactivate user action with confirmation
- Real-time data refresh after operations
- Toast notifications for success/error states

### Toast Notifications

Located in: `apps/web/hooks/use-toast.ts`

Simple toast hook for user notifications:
- Success messages logged to console (non-intrusive)
- Error messages shown as alerts
- Can be replaced with a proper toast library (sonner, react-hot-toast) in production

## Security & Permissions

### Backend Authorization

All endpoints require:
1. JWT authentication via `JwtAuthGuard`
2. Platform admin permissions via `checkPlatformAdminPermission()`

**Permission Checks:**
- Tenants: requires `tenants:manage` or wildcard `*`
- Users: requires `users:manage` or wildcard `*`
- Shared Companies: requires `shared-data:manage` or wildcard `*`

### Frontend Authorization

Components check user permissions using:
- `canManageTenants(user)` - For tenant management
- `canManagePlatformUsers(user)` - For user management

Access denied message shown if user lacks permissions.

## Database Schema

### Organizations Table
- `id` (uuid, primary key)
- `name` (text)
- `slug` (text, unique)
- `domain` (text, nullable)
- `status` (text: active/inactive/suspended)
- `subscription_tier` (text: basic/professional/enterprise)
- `settings` (jsonb)
- `metadata` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Users Table
- `id` (uuid, primary key)
- `organization_id` (uuid, foreign key)
- `email` (citext, unique)
- `name` (text)
- `password_hash` (text)
- `avatar_url` (text, nullable)
- `status` (text: active/inactive/suspended)
- `last_login_at` (timestamptz, nullable)
- `email_verified_at` (timestamptz, nullable)
- `settings` (jsonb)
- `metadata` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### User_Roles Table
- `user_id` (uuid, foreign key)
- `role_id` (uuid, foreign key)
- `organization_id` (uuid, foreign key)
- `assigned_at` (timestamptz)

## Testing

### Manual Testing Checklist

**Tenant Operations:**
- [ ] Create tenant without admin user
- [ ] Create tenant with admin user
- [ ] Update tenant name
- [ ] Update tenant domain
- [ ] Change subscription tier
- [ ] Toggle status (activate/deactivate)
- [ ] Delete tenant (soft delete)
- [ ] Verify permission checks

**User Operations:**
- [ ] Create user with organization
- [ ] Create user with role assignment
- [ ] Update user name
- [ ] Update user status
- [ ] Update user role
- [ ] Delete user (soft delete)
- [ ] Verify permission checks
- [ ] Verify password hashing

**Data Consistency:**
- [ ] Verify cache invalidation after create/update/delete
- [ ] Verify data refresh in UI
- [ ] Verify error handling for invalid data
- [ ] Verify validation messages

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Create tenant
curl -X POST http://localhost:3001/api/v1/platform-admin/tenants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "domain": "test.com",
    "subscriptionTier": "basic"
  }'

# Update tenant
curl -X PUT http://localhost:3001/api/v1/platform-admin/tenants/TENANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company",
    "status": "active"
  }'

# Delete tenant
curl -X DELETE http://localhost:3001/api/v1/platform-admin/tenants/TENANT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

### Recommended Improvements

1. **Role Management UI**
   - Add dropdown with available roles in create/edit user dialogs
   - Fetch roles from backend API

2. **Better Toast Notifications**
   - Replace simple alert() with proper toast library
   - Add toast container to app layout
   - Support for different toast types (success, error, warning, info)

3. **Form Validation**
   - Add client-side validation using libraries like Zod or Yup
   - Show validation errors inline
   - Prevent submission of invalid data

4. **Audit Logging**
   - Log all CRUD operations in audit_logs table
   - Track who made changes and when
   - Add audit log viewer in platform admin

5. **Batch Operations**
   - Support selecting multiple tenants/users
   - Bulk update status
   - Bulk delete

6. **Advanced Filtering**
   - Add search functionality
   - Filter by status, tier, date range
   - Sort by different columns

7. **Pagination**
   - Implement pagination controls
   - Server-side pagination support
   - Configurable page size

8. **Hard Delete Option**
   - Add option to permanently delete (with confirmation)
   - Only for platform admins
   - Show warning about data loss

9. **Tenant Statistics**
   - Show detailed statistics for each tenant
   - User activity, data usage, API calls
   - Growth trends over time

10. **Email Notifications**
    - Send welcome email when creating tenant/user
    - Notify admin when status changes
    - Password reset functionality

## Known Limitations

1. **Toast Notifications**: Currently uses browser alert() for errors. Should be replaced with a proper toast library.

2. **Role Selection**: Users can't select specific roles during creation/edit. Role assignment is optional and needs improvement.

3. **Hard Delete**: Only soft delete is implemented. Hard delete with cascade requires additional consideration.

4. **Validation**: Frontend validation is minimal. Should add comprehensive validation with error messages.

5. **Confirmation Dialogs**: Uses browser confirm() which is not ideal for UX. Should use custom confirmation dialogs.

6. **Password Requirements**: Password validation is only on backend. Should show requirements to user during creation.

## Conclusion

The platform admin CRUD operations are now fully functional with:
- Complete backend API with DTOs, controllers, and services
- Frontend forms with state management and error handling
- Security checks and permission validation
- Cache invalidation and data refresh
- User feedback through notifications

The implementation follows best practices and provides a solid foundation for managing tenants and users in the platform.
