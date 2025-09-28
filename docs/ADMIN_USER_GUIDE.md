# Multi-Tenant Admin System - User Guide

## Overview
Selly Base now supports two distinct administrative interfaces designed for different user types in our multi-tenant platform architecture.

## Admin Types

### 🟣 Platform Admin (Albaly Team)
**Who**: Albaly platform administrators
**Access**: `platform@albaly.com / platform123`  
**URL**: `/platform-admin`
**Purpose**: Manage the entire Selly Base platform

### 🔵 Customer Admin (Tenant Organizations)  
**Who**: Customer organization administrators
**Access**: `admin@selly.com / admin123` (legacy account)
**URL**: `/admin`
**Purpose**: Manage specific tenant organization

## Key Differences

| Feature | Platform Admin | Customer Admin |
|---------|---------------|----------------|
| **Scope** | Entire platform | Single organization |
| **Data Access** | All tenant data | Organization data only |
| **User Management** | Cross-tenant users | Organization users only |
| **Company Data** | Manage shared 45K+ companies | Access shared data, manage org data |
| **Visual Theme** | Purple badges & accents | Blue badges & accents |
| **Navigation Label** | "Platform Admin" | "Organization Admin" |

## Platform Admin Capabilities

### Dashboard Overview
- **Active Tenants**: Monitor all customer organizations (12 active)
- **Total Users**: Track platform-wide user base (1,247 users)  
- **Shared Companies**: Manage 45,231 companies from DBD warehouse
- **System Health**: Monitor 99.9% platform uptime

### Tenant Management
- Create new customer organizations
- Manage subscription tiers (Basic, Professional, Enterprise)
- Monitor organization activity and data usage
- Configure tenant-specific settings

### Shared Data Management
- Upload companies available to all tenants
- Manage DBD warehouse integration
- Bulk import platform-wide company data
- Maintain data quality across the platform

## Customer Admin Capabilities

### Organization Management
- Manage users within your organization only
- Set data access policies for your team
- Configure export permissions and limits
- Manage organization-specific integrations

### Data Scope
- **Shared Data**: Can view Albaly-provided companies (45K+ from DBD)
- **Private Data**: Full control over organization-uploaded data
- **User Lists**: Manage organization users' company lists
- **Policies**: Set organization-specific data access rules

## Getting Started

### For Platform Admins
1. Login with platform admin credentials
2. Navigate to "Platform Admin" in the main menu
3. Start with the "Tenants" tab to see all organizations
4. Use "Shared Data" tab to manage platform-wide companies
5. Monitor system health through the dashboard metrics

### For Customer Admins  
1. Login with your organization admin credentials
2. Navigate to "Organization Admin" in the main menu
3. Review the scope warning to understand limitations
4. Manage your organization users in "Users & Roles" tab
5. Configure policies in "Policies" tab for your team

## Visual Identification

### Platform Admin Interface
- **Color**: Purple theme throughout
- **Badge**: Purple "Platform Admin" badge with shield icon
- **Metrics**: Platform-wide numbers (thousands of users, multiple tenants)
- **Scope Text**: "Manage the entire Selly Base platform, tenant organizations..."

### Customer Admin Interface  
- **Color**: Blue theme throughout
- **Badge**: Blue "Customer Admin" badge with building icon
- **Warning**: Orange notice about organization-only scope
- **Scope Text**: "Manage your organization's users, policies, and tenant-specific settings"

## Data Isolation

### What Platform Admins Can Access
- ✅ All tenant organizations and their data
- ✅ All users across all tenants
- ✅ Platform-wide analytics and metrics
- ✅ Shared company database management
- ✅ System configuration and settings

### What Customer Admins Can Access  
- ✅ Their organization's users only
- ✅ Their organization's private data
- ✅ Shared Albaly company data (read-only)
- ✅ Organization-specific policies and settings
- ❌ Other tenants' data or users
- ❌ Platform-wide system settings

## Security & Permissions

### Route Protection
- Platform admin routes are protected by middleware
- Customer admin routes verify organization membership
- Cross-tenant data access is automatically filtered
- Role-based navigation prevents unauthorized access

### Data Separation
- Database queries automatically scope to tenant context
- Shared data is marked with global visibility flags  
- Import/export operations respect tenant boundaries
- Audit logs track cross-tenant vs organization actions

## Best Practices

### For Platform Admins
1. **Tenant Monitoring**: Regularly check tenant activity and health
2. **Data Quality**: Maintain high quality shared company database
3. **Performance**: Monitor system metrics and capacity planning
4. **Support**: Assist customer admins with organization-level issues

### For Customer Admins
1. **User Management**: Regularly review and update user permissions
2. **Data Policies**: Set appropriate export and access limitations  
3. **Training**: Ensure users understand shared vs private data distinction
4. **Compliance**: Follow organizational data handling requirements

## Support & Troubleshooting

### Common Issues
- **Can't see other organizations**: This is by design for customer admins
- **Limited data access**: Customer admins only see their organization's data
- **Missing menu items**: Menu items are role-based and context-sensitive
- **Authentication problems**: Ensure using correct admin type credentials

### Getting Help
- **Platform Admins**: Contact Albaly technical team for platform issues
- **Customer Admins**: Use organization admin account or contact platform admin
- **Documentation**: Refer to technical docs in `docs/MULTI_TENANT_ADMIN.md`

## Future Enhancements

### Planned Features
- Advanced cross-tenant analytics for platform admins
- Tenant-specific branding and customization  
- Enhanced audit logging with tenant attribution
- Multi-level role hierarchies within organizations
- Advanced data export and migration tools

This multi-tenant admin system provides the foundation for secure, scalable customer organization management while maintaining platform-level administrative control.