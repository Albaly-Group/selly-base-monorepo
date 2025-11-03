# Platform Admin - Tenant Management

Platform Admins manage the entire Selly Base platform, including all customer organizations (tenants).

## Overview

**Available to:** Platform Admin only

**URL:** `/platform-admin`

📸 **Screenshot:** `platform-admin-platform-admin-main-view-01.png`

**Platform Admin Interface:**
- Purple theme and badges
- Cross-tenant access
- Platform-wide metrics
- Full system control

## Platform Admin Dashboard

### Key Metrics

**Platform Overview:**
- **Active Tenants:** Total customer organizations (e.g., 12)
- **Total Users:** All users across all tenants (e.g., 1,247)
- **Shared Companies:** Platform-wide company database (e.g., 45,231)
- **System Health:** Platform uptime and performance (e.g., 99.9%)

**Tenant Statistics:**
- New tenants this month
- Active subscriptions
- Resource usage
- Revenue metrics

## Managing Tenants

### View All Tenants

**Tenants Table Shows:**
- Organization name
- Subscription tier
- User count
- Status (Active/Suspended)
- Created date
- Last activity
- Actions

**Filter Options:**
- By subscription tier
- By status
- By user count
- By creation date

### Create New Tenant

**Step 1: Click "Create Tenant"**

**Step 2: Enter Organization Details**

✅ **Required Information:**
- Organization name
- Admin email
- Admin name
- Subscription tier
- Billing details

**Optional Settings:**
- Logo
- Domain
- Contact information
- Industry
- Company size

**Step 3: Configure Subscription**

**Subscription Tiers:**
- **Basic:** Up to 5 users, 1,000 companies
- **Professional:** Up to 25 users, 10,000 companies
- **Enterprise:** Unlimited users and companies
- **Custom:** Tailored plans

**Features by Tier:**
- User limits
- Data quotas
- Export limits
- API access
- Premium features
- Support level

**Step 4: Set Initial Configuration**
- Default permissions
- Data access rules
- Feature flags
- Integration settings

**Step 5: Create Tenant**
- Review all details
- Click "Create Organization"
- Tenant created
- Welcome email sent

📸 **Screenshot:** Create tenant form (to be captured)

### Edit Tenant

**Update tenant information:**
1. Find tenant in list
2. Click "Edit"
3. Modify details:
   - Organization info
   - Subscription tier
   - User limits
   - Features enabled
   - Billing details
4. Save changes

### Manage Tenant Subscriptions

**Upgrade/Downgrade:**
1. Select tenant
2. Click "Change Subscription"
3. Choose new tier
4. Set effective date
5. Confirm change

**Billing Management:**
- View payment history
- Update payment method
- Issue invoices
- Apply discounts
- Manage renewals

### Suspend/Activate Tenant

**Suspend Tenant:**
- Temporarily disable
- Users cannot login
- Data preserved
- Can reactivate

**Activate Tenant:**
- Restore full access
- Users can login
- All features available

**Delete Tenant:**
⚠️ **Extreme caution:** Permanently removes organization
- All user accounts deleted
- All data removed
- Cannot be undone
- Requires confirmation

## Shared Data Management

### Platform-Wide Company Database

**Manage 45,000+ shared companies:**
- Upload bulk data
- Update existing companies
- Remove companies
- Quality control

### Upload Shared Companies

**Step 1: Prepare Data File**
- CSV or Excel format
- Required fields:
  - Company name
  - Industry
  - Location
  - Tax ID
- Validated data
- No duplicates

**Step 2: Upload File**
1. Go to "Shared Data" tab
2. Click "Upload Companies"
3. Select file
4. Map columns
5. Validate data

**Step 3: Review and Import**
- Check validation results
- Fix any errors
- Choose duplicate handling
- Execute import

**Step 4: Publish to Tenants**
- Select target tenants (or all)
- Set visibility rules
- Publish immediately or schedule
- Monitor propagation

📸 **Screenshot:** Shared data upload (to be captured)

### Maintain Data Quality

**Quality Control:**
- Remove duplicates
- Validate information
- Update outdated records
- Enrich data
- Standardize formats

**Data Sources:**
- DBD warehouse integration
- Third-party providers
- Manual uploads
- API integrations

## Cross-Tenant User Management

### View All Platform Users

**Users Across All Tenants:**
- Platform-wide user list
- Filter by organization
- Search by email/name
- View user details

**User Information:**
- User details
- Tenant/organization
- Role within org
- Platform role (if any)
- Activity across tenants
- Login history

### Manage Platform-Level Users

**Platform Administrator:**
- Full platform access
- Tenant management
- System configuration
- All data access

**Platform Staff:**
- Support role
- Limited admin access
- Cross-tenant support
- Read-only by default

**Create Platform User:**
1. Click "Add Platform User"
2. Enter details
3. Assign platform role
4. Set permissions
5. Grant tenant access (if needed)
6. Create account

### Cross-Tenant Operations

**User Support:**
- Reset passwords across orgs
- Unlock accounts
- View user activity
- Impersonate user (audit logged)
- Transfer users between orgs

## Platform Analytics

### System-Wide Metrics

**Performance Metrics:**
- API response times
- Database performance
- Server load
- Error rates
- Uptime percentage

**Usage Metrics:**
- Active users (daily/monthly)
- API calls
- Data transfer
- Storage usage
- Feature adoption

**Business Metrics:**
- New tenant signups
- Churn rate
- Revenue trends
- User growth
- Upgrade/downgrade rates

### Generate Platform Reports

**Available Reports:**
- Tenant activity report
- Revenue report
- System performance report
- User growth report
- Feature usage report
- Support tickets report

**Report Options:**
- Date range
- Tenant selection
- Metric selection
- Export format

## Audit Logs

### Platform Audit Trail

**Track All Administrative Actions:**
- Tenant creation/deletion
- Subscription changes
- User management
- Data uploads
- Configuration changes
- Security events

**Log Details:**
- Action performed
- Who performed it
- When it occurred
- Which tenant affected
- Result (success/failure)
- Additional details

**Search and Filter:**
- By date range
- By admin user
- By action type
- By tenant
- By result

**Export Audit Logs:**
- CSV format
- JSON format
- PDF report
- Date range selection
- Compliance reporting

## System Configuration

### Platform Settings

**General Configuration:**
- Platform name and branding
- Support contact info
- Default settings
- Feature flags
- Maintenance mode

**Email Configuration:**
- Email server settings
- Email templates
- Notification rules
- Bounce handling
- Unsubscribe management

**Security Settings:**
- Platform-wide security
- Password policies
- Session management
- API rate limits
- IP whitelisting

**Integration Settings:**
- Third-party services
- Payment gateway
- Analytics tools
- Monitoring services
- Backup systems

### Feature Management

**Enable/Disable Features:**
- Platform-wide features
- Tenant-specific features
- Beta features
- Experimental features

**Feature Flags:**
- Gradual rollout
- A/B testing
- Tenant targeting
- User targeting

## Monitoring and Alerts

### System Health Monitoring

**Monitor:**
- Server status
- Database health
- API performance
- Storage capacity
- Network connectivity

**Alerts for:**
- System downtime
- Performance degradation
- High error rates
- Capacity issues
- Security events

**Alert Channels:**
- Email notifications
- SMS alerts
- Slack integration
- PagerDuty
- Custom webhooks

### Automated Responses

**Auto-scaling:**
- Server capacity
- Database resources
- Storage allocation
- Bandwidth

**Failover:**
- Database replication
- Server redundancy
- Load balancing
- Disaster recovery

## Best Practices

### Tenant Management

📋 **Recommendations:**

1. **Regular Reviews**
   - Monthly tenant health checks
   - Subscription compliance
   - Usage monitoring
   - Support needs

2. **Communication**
   - Proactive updates
   - Maintenance notices
   - Feature announcements
   - Security advisories

3. **Data Management**
   - Regular data updates
   - Quality assurance
   - Backup verification
   - Compliance audits

4. **Security**
   - Monitor access patterns
   - Review audit logs
   - Update security policies
   - Incident response planning

### Platform Operations

⚡ **Operational Excellence:**

1. **Performance**
   - Monitor continuously
   - Optimize regularly
   - Plan capacity
   - Test scaling

2. **Reliability**
   - Maintain high uptime
   - Quick incident response
   - Regular backups
   - Disaster recovery testing

3. **Security**
   - Security audits
   - Penetration testing
   - Compliance monitoring
   - Access reviews

---

**Previous:** [Admin Settings ←](15-admin-settings.md)  
**Next:** [Platform Shared Data →](17-platform-shared-data.md)
