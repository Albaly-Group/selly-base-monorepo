# Multi-Tenant Admin Interface Documentation

## Overview
This document outlines the multi-tenant administration system for Selly Base, which separates platform administration (Albaly) from customer organization administration.

## Architecture

### User Roles & Permissions

#### Legacy Roles (Backward Compatible)
- **user** - Basic tenant user access
- **staff** - Tenant staff with database management
- **admin** - Tenant administrator (mapped to customer_admin)

#### New Multi-Tenant Roles  
- **customer_admin** - Administrator for a specific tenant organization
- **platform_admin** - Albaly platform administrator with cross-tenant access

### Data Separation Model

#### Shared Data (Albaly-Provided)
- **Source**: Albaly/DBD data warehouse
- **Visibility**: Available to ALL tenants
- **Management**: Platform admins only
- **Examples**: Official company registrations, government data

#### Tenant-Specific Data  
- **Source**: Customer uploads/imports
- **Visibility**: Only within the tenant organization
- **Management**: Customer admins within their tenant
- **Examples**: Custom lists, user-uploaded companies, notes

## Admin Interfaces

### Platform Admin (`/platform-admin`)
**Access**: `platform_admin` role only  
**Purpose**: Manage the entire Selly Base platform

#### Features:
- **Tenant Management**: Create, configure, and manage customer organizations
- **Shared Data Management**: Manage company data available to all tenants
- **Platform Analytics**: Cross-tenant usage statistics and reporting
- **System Settings**: Platform-wide configuration

#### Key Responsibilities:
- Create new tenant organizations
- Manage shared company database (45K+ companies from DBD)
- Monitor platform health and usage
- Configure system-wide settings

### Customer Admin (`/admin`) 
**Access**: `admin` or `customer_admin` roles  
**Purpose**: Manage a specific tenant organization

#### Features:
- **User Management**: Add/remove users within the organization
- **Organization Policies**: Set data access and export permissions
- **Data Retention**: Configure tenant-specific data lifecycle  
- **Integration Settings**: Manage tenant-specific integrations

#### Key Responsibilities:
- Manage organization users and roles
- Set policies for data access and exports
- Configure tenant-specific settings
- Monitor organization usage

## User Interface Design

### Visual Distinctions

#### Platform Admin Interface
- **Header Badge**: Purple "Platform Admin" badge with shield icon
- **Color Scheme**: Purple accents (purple-50, purple-700)
- **Scope Indicators**: "Platform-wide", "All tenants", "System-level"

#### Customer Admin Interface  
- **Header Badge**: Blue "Customer Admin" badge with building icon
- **Color Scheme**: Blue accents (blue-50, blue-700)
- **Scope Indicators**: "Your organization", "Organization-only"
- **Warning Text**: Clear notice about tenant-specific scope

### Navigation Updates
- **Platform Admin**: Dedicated "Platform Admin" menu item
- **Customer Admin**: Renamed to "Organization Admin" to clarify scope
- **Role-based Visibility**: Menu items shown based on user roles

## Authentication & Security

### Mock Users for Testing
```typescript
// Platform Admin
Email: platform@albaly.com
Password: platform123
Role: platform_admin
Organization: null (cross-tenant access)

// Customer Admin
Email: admin@customer1.com  
Password: admin123
Role: customer_admin
Organization: Customer Company 1

// Legacy Admin (backward compatibility)
Email: admin@selly.com
Password: admin123  
Role: admin (mapped to customer_admin)
Organization: Customer Company 1
```

### Route Protection
- **Middleware**: Enhanced to check tenant-specific permissions
- **Platform Routes**: `/platform-admin/*` requires `platform_admin` role
- **Customer Routes**: `/admin/*` requires `admin` or `customer_admin` role
- **Data Filtering**: Automatic tenant scoping for non-platform admins

## Data Access Patterns

### Platform Admin Data Access
```typescript
// Can access ALL tenant data
const companies = await getCompanies(); // All companies across all tenants
const users = await getUsers(); // All users across all tenants
const analytics = await getAnalytics(); // Platform-wide metrics
```

### Customer Admin Data Access  
```typescript
// Filtered to organization context
const companies = await getCompanies({ 
  organizationId: user.organization_id,
  includeShared: true // Albaly shared data
});
const users = await getUsers({ 
  organizationId: user.organization_id 
}); // Only organization users
```

## Implementation Details

### Key Components

#### Platform Admin Components
- `TenantManagementTab` - Manage customer organizations
- `PlatformDataTab` - Manage shared company database
- `PlatformUsersTab` - Cross-tenant user management (future)
- `PlatformAnalyticsTab` - Platform-wide analytics (future)
- `PlatformSettingsTab` - System-wide settings (future)

#### Enhanced Customer Admin Components
- Enhanced scope indicators and warnings
- Tenant-specific user management  
- Organization-scoped policies
- Clear data access boundaries

### Type System Updates
```typescript
interface Organization {
  id: string
  name: string
  domain?: string
  status: 'active' | 'inactive' | 'suspended'
  subscription_tier?: 'basic' | 'professional' | 'enterprise'
}

interface User {
  // ... existing fields
  organization_id?: string | null // null for platform admins
  organization?: Organization | null
  role?: UserRoleName // Extended with new roles
}

type UserRoleName = 
  | "user" | "staff" | "admin" // Legacy
  | "customer_admin" | "platform_admin" // New multi-tenant
```

## UX/UI Design Principles

### Clear Role Identification
- Prominent role badges in headers
- Color-coded interfaces (purple for platform, blue for customer)
- Contextual help text explaining scope

### Data Scope Clarity
- Visual indicators for shared vs tenant-specific data
- Clear warnings about access limitations
- Consistent terminology ("organization" vs "platform")

### Progressive Disclosure
- Core functionality immediately available
- Advanced features marked as "Coming Soon"
- Phased rollout approach for complex features

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Cross-tenant user management for platform admins
- [ ] Advanced platform analytics with tenant breakdowns
- [ ] Tenant-specific branding and customization
- [ ] Advanced audit logging across tenants

### Phase 3: Enterprise Features  
- [ ] Multi-level tenant hierarchies
- [ ] Advanced role-based permissions within tenants
- [ ] Tenant data export and migration tools
- [ ] Advanced security features (2FA, SSO)

## Testing & Validation

### Test Scenarios
1. **Platform Admin Access**: Verify platform admin can manage all tenants
2. **Customer Admin Isolation**: Verify customer admin only sees own organization
3. **Shared Data Visibility**: Verify Albaly data visible to all tenants
4. **Navigation Security**: Verify role-based menu item visibility
5. **Route Protection**: Verify middleware blocks unauthorized access

### Demo Flow
1. Login as `platform@albaly.com` → Access Platform Admin interface
2. Create/manage tenant organizations
3. Manage shared company database
4. Login as `admin@customer1.com` → Access Customer Admin interface  
5. Verify tenant-specific scope and data isolation

## Summary

This multi-tenant admin system provides:
- **Clear separation** between platform and customer administration
- **Secure data isolation** with shared Albaly data access
- **Intuitive UX/UI** with visual role indicators and scope clarity
- **Backward compatibility** with existing role system
- **Scalable architecture** for future multi-tenant features