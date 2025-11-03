# Organization Admin - User Management

Customer Admins can manage all users, roles, and permissions within their organization.

## Overview

**Available to:** Customer Admin only

**URL:** `/admin`

📸 **Screenshot:** `customer-admin-admin-main-view-01.png`

**Organization Admin Interface:**
- Blue theme and badges
- Organization-scoped access
- Warning about limitations
- Full user management within organization

## Admin Page Overview

### Main Tabs

1. **Users & Roles:** Manage organization users
2. **Policies:** Configure data access policies
3. **Settings:** Organization settings
4. **Activity:** Monitor user activity

**Scope Notice:** Orange banner indicates organization-only access

##Managing Organization Users

### View All Users

**Users Table Shows:**
- User name and email
- Assigned roles
- Status (Active/Inactive)
- Last login
- Created date
- Actions

**Filter Options:**
- By role
- By status
- By department
- By date joined

### Add New User

**Step 1: Click "Add User"**

**Step 2: Enter User Details**

✅ **Required:**
- Email address
- First name
- Last name
- Role selection

**Optional:**
- Phone number
- Department
- Manager
- Custom fields

**Step 3: Assign Role**

**Available Roles:**
- **User:** Basic access (read-only + personal lists)
- **Staff:** Data management (lists, imports, exports, reports)
- **Customer Admin:** Organization admin (manage users, policies)

**Step 4: Set Permissions**
- Customize specific permissions
- Set data access limits
- Configure export quotas
- Assign to teams

**Step 5: Create User**
- Review details
- Send invitation email
- Set password requirements
- Create account

📸 **Screenshot:** Add user form (to be captured)

### Edit User

**Update user information:**
1. Find user in table
2. Click "Edit" button
3. Modify details
4. Change role if needed
5. Update permissions
6. Save changes

**Editable Fields:**
- Personal information
- Contact details
- Role assignment
- Permission settings
- Status
- Password (reset)

### Deactivate User

**Temporarily disable access:**
1. Select user
2. Click "Deactivate"
3. Confirm action
4. User loses access immediately
5. Can be reactivated later

**What happens:**
- Login disabled
- Sessions terminated
- Data preserved
- Lists remain
- History retained

### Remove User

**Permanently delete:**
1. Select user
2. Click "Remove"
3. Type confirmation
4. Transfer data (optional)
5. Delete permanently

⚠️ **Warning:** Cannot be undone. All user data deleted except audit logs.

## Managing User Roles

### Built-in Roles

**User Role:**
- Company search and view
- Create personal lists
- Basic export (limited)
- View reports (own)

**Staff Role:**
- All User permissions
- Manage company lists (team)
- Import/export data
- Generate reports
- Staff coordination

**Customer Admin Role:**
- All Staff permissions
- Manage users
- Configure policies
- Organization settings
- View analytics

### Custom Roles

**Create Custom Role:**
1. Go to "Roles" tab
2. Click "Create Custom Role"
3. Name the role
4. Select permissions
5. Save role

**Available Permissions:**

**Company Management:**
- companies:read
- companies:create
- companies:update
- companies:delete

**List Management:**
- company-lists:read
- company-lists:create
- company-lists:update
- company-lists:delete
- company-lists:share

**Data Operations:**
- imports:create
- exports:create
- reports:view
- reports:create

**User Management:**
- org-users:view
- org-users:manage

### Assign Roles to Users

**Single User:**
1. Edit user
2. Select role dropdown
3. Choose role(s)
4. Save

**Multiple Users:**
1. Select users (checkboxes)
2. Click "Assign Role"
3. Choose role
4. Apply to all selected

## Configuring Data Policies

### Access Policies

**Control what users can access:**

**Data Visibility:**
- All company data
- Department data only
- Assigned data only
- Custom filters

**Geographic Restrictions:**
- All locations
- Specific countries
- Specific regions
- Custom boundaries

**Industry Restrictions:**
- All industries
- Specific sectors
- Exclude industries
- Custom categories

### Export Policies

**Set export limits:**

**By Role:**
- Maximum exports per day
- Maximum rows per export
- Allowed formats
- Retention period

**By User:**
- Individual limits
- Override role defaults
- Special permissions
- Temporary increases

**Approval Required:**
- Exports over threshold
- Sensitive data fields
- Full database exports
- Cross-department data

### Usage Quotas

**Set limits on:**
- API calls per day
- Storage space
- Number of lists
- Saved searches
- Concurrent users

## Organization Settings

### General Settings

**Organization Profile:**
- Organization name
- Logo upload
- Contact information
- Business details
- Timezone
- Language

**User Defaults:**
- Default role for new users
- Default permissions
- Welcome email template
- Password policy
- Session timeout

### Integration Settings

**Connect external systems:**

**CRM Integration:**
- Salesforce
- HubSpot
- Dynamics 365
- Custom API

**Email Integration:**
- SMTP settings
- Email templates
- Notification preferences

**SSO/SAML:**
- Configure single sign-on
- Identity provider settings
- SAML configuration
- Testing tools

### Notification Settings

**Configure notifications:**

**System Notifications:**
- User activity
- Data changes
- Security alerts
- System updates

**User Notifications:**
- Welcome emails
- Password resets
- Export completion
- Report delivery
- Policy changes

### Security Settings

**Organization security:**

**Authentication:**
- Password requirements
- MFA enforcement
- Session duration
- Login IP restrictions

**Data Security:**
- Encryption settings
- Audit logging
- Data retention
- Backup schedule

**Access Control:**
- Failed login attempts
- Account lockout duration
- Password expiration
- Force password change

## Activity Monitoring

### User Activity Dashboard

**Monitor:**
- Active users
- Login history
- Feature usage
- Data access
- Export activity
- Report generation

### Activity Logs

**View detailed logs:**
- User actions
- Timestamps
- IP addresses
- Affected resources
- Result (success/failure)

**Log Categories:**
- Authentication
- Data access
- Modifications
- Exports
- Administrative actions

### Audit Trail

**Compliance reporting:**
- User access history
- Data modifications
- Permission changes
- Policy updates
- Export records

**Export Audit Logs:**
- Date range selection
- Filter by user
- Filter by action
- Download as CSV/PDF

## Best Practices

### User Management

📋 **Recommendations:**

1. **Least Privilege**
   - Give minimum necessary permissions
   - Increase as needed
   - Regular permission reviews
   - Remove unused permissions

2. **Regular Audits**
   - Review user list monthly
   - Remove inactive users
   - Update permissions
   - Check role assignments

3. **Documentation**
   - Document role definitions
   - Maintain user procedures
   - Track permission changes
   - Update policies regularly

4. **Security**
   - Enforce strong passwords
   - Enable MFA
   - Monitor login attempts
   - Review access logs

### Policy Configuration

🎯 **Best Practices:**

1. **Clear Policies**
   - Document policies clearly
   - Communicate to users
   - Enforce consistently
   - Review periodically

2. **Balanced Access**
   - Enable productivity
   - Maintain security
   - Flexible when needed
   - Restrictive where necessary

3. **Regular Reviews**
   - Quarterly policy review
   - Update as needed
   - Get user feedback
   - Adapt to changes

## Troubleshooting

### Cannot Add Users

**Possible causes:**
- User limit reached for plan
- Duplicate email address
- Invalid email format
- Missing required fields

**Solutions:**
- Upgrade plan
- Use unique email
- Correct format
- Complete all fields

### User Cannot Login

**Common issues:**
- Account not activated
- Incorrect credentials
- Account locked
- MFA issues

**Solutions:**
- Resend activation email
- Reset password
- Unlock account
- Reset MFA

### Permission Issues

**User reports access denied:**
- Verify role assignment
- Check specific permissions
- Review data policies
- Check organization scope

**Solutions:**
- Update role
- Grant permissions
- Adjust policies
- Confirm organization

---

**Previous:** [Staff Management ←](12-staff-management.md)  
**Next:** [Admin Policy Configuration →](14-admin-policies.md)
