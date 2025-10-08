# Shared Data Permissions Implementation

## Overview
This document describes the implementation of the three key requirements for company data permissions and CRUD operations.

## Requirements Implemented

### 1. Platform Admins Can Edit Shared Data ✅
**Requirement:** Platform admins are users responsible for shared data, so they must be able to edit that data including full CRUD operations.

**Implementation:**
- Added `canEditSharedData()` permission helper in `apps/web/lib/auth.tsx`
- Updated `CompanyEditDialog` to check permissions using `canEditSharedData()`
- Platform admins with `shared-data:manage` or `*` wildcard permission can now edit shared data
- All form fields in the edit dialog respect the `canEdit` permission
- Added blue informational banner for platform admins when editing shared data
- Updated `CompanyDetailDrawer` to show enabled Edit button for platform admins on shared data

**User Experience:**
- **Platform Admin editing shared data:** Blue info banner appears saying "You have platform admin privileges to edit this shared data. Changes will affect all organizations using this data."
- **Non-admin viewing shared data:** Red warning banner appears saying "This company is from a shared data source and cannot be edited. Only platform admins can edit shared data."
- Edit button is enabled for platform admins, disabled for others

### 2. Contact Menu Has Its Own CRUD Box ✅
**Requirement:** Contact menu should have their own box to CRUD, don't need in main company data edit form.

**Implementation:**
- Completely removed the "Contact Persons" section from `CompanyEditDialog`
- Removed unused functions: `addContactPerson()`, `updateContactPerson()`, `removeContactPerson()`
- Removed unused imports: `ContactPerson` type, `Plus` and `Trash2` icons
- Contact management remains available through separate dialogs in `CompanyDetailDrawer`

**User Experience:**
- Company Edit Dialog now only shows:
  - Basic Information (name, registration, description)
  - Contact Information (email, phone, website)
  - Address Information
  - Company Details (size, employee count, data sensitivity)
  - Data Verification (for owners only)
- Contacts are managed through dedicated "Add Contact" and "Edit Contact" dialogs in the company detail drawer

### 3. Organization Owners Can Set Verification Status ✅
**Requirement:** The company data owner organization should be able to put the data status verified or other else.

**Implementation:**
- Added `isOwner` check in `CompanyEditDialog` comparing `user.organization_id` with `company.organization_id`
- Added "Data Verification" section that only appears when `isOwner` is true
- Verification status field allows setting: Verified, Unverified, Disputed, Inactive
- Backend update includes verification status when user is owner
- Added helpful text: "As the data owner, you can set the verification status for this company."

**User Experience:**
- **Organization owners:** See "Data Verification" section with dropdown to set status
- **Non-owners:** Don't see the verification status section at all
- Verification status is saved along with other company data updates

## Code Changes Summary

### File: `apps/web/lib/auth.tsx`
```typescript
// Added new helper function
export function canEditSharedData(user: User): boolean {
  // Platform admins with shared-data:manage or wildcard can edit shared data
  return hasPermission(user, 'shared-data:manage') || hasPermission(user, '*')
}
```

### File: `apps/web/components/company-edit-dialog.tsx`
**Key Changes:**
1. Import `useAuth` and `canEditSharedData`
2. Added permission checks:
   ```typescript
   const canEdit = company?.isSharedData ? (user ? canEditSharedData(user) : false) : true
   const isOwner = user?.organization_id && company?.organization_id === user.organization_id
   ```
3. All form fields use `disabled={!canEdit}` instead of `disabled={company?.isSharedData}`
4. Added conditional banner messages for platform admins vs regular users
5. Added verification status section for organization owners
6. Removed entire contact persons section
7. Updated submit button to use `!canEdit`

### File: `apps/web/components/company-detail-drawer.tsx`
**Key Changes:**
1. Import `useAuth` and `canEditSharedData`
2. Updated Edit button logic:
   ```typescript
   {!company.isSharedData || (user && canEditSharedData(user)) ? (
     <Button onClick={() => setShowEditDialog(true)}>Edit</Button>
   ) : (
     <Button disabled title="Cannot edit shared reference data. Only platform admins can edit shared data.">
       Edit
     </Button>
   )}
   ```

## Testing Recommendations

### Manual Testing Scenarios

#### Scenario 1: Platform Admin Editing Shared Data
1. Login as platform admin (user with `shared-data:manage` or `*` permission)
2. Navigate to a company marked as `isSharedData: true`
3. Click Edit button (should be enabled)
4. Verify blue info banner appears
5. Verify all fields are editable
6. Make changes and save
7. Verify changes are saved successfully

#### Scenario 2: Regular User Viewing Shared Data
1. Login as regular user (without `shared-data:manage` permission)
2. Navigate to a company marked as `isSharedData: true`
3. Verify Edit button is disabled with tooltip
4. If somehow edit dialog opens, verify red warning banner
5. Verify all fields are disabled
6. Verify Save button is disabled

#### Scenario 3: Organization Owner Setting Verification Status
1. Login as organization admin
2. Navigate to a company owned by their organization (matching `organization_id`)
3. Click Edit button
4. Scroll to "Data Verification" section (should be visible)
5. Select a verification status from dropdown
6. Save changes
7. Verify verification status is updated

#### Scenario 4: Non-Owner Cannot Set Verification Status
1. Login as user from different organization
2. Navigate to a company owned by another organization
3. Click Edit button
4. Verify "Data Verification" section does not appear
5. Make other changes (if permitted)
6. Save and verify verification status is not changed

#### Scenario 5: Contact Management Separate from Company Edit
1. Open company detail drawer
2. Click Edit button to open company edit dialog
3. Verify no "Contact Persons" section in the dialog
4. Close company edit dialog
5. Click "Add Contact" button in company detail drawer
6. Verify separate contact dialog opens
7. Add/edit contacts through the separate dialog

## Permission Matrix

| User Type | Edit Regular Company | Edit Shared Company | Set Verification Status | Manage Contacts |
|-----------|---------------------|---------------------|------------------------|-----------------|
| Platform Admin | ✅ Yes | ✅ Yes | ✅ Yes (if owner) | ✅ Yes |
| Organization Owner | ✅ Yes (own data) | ❌ No | ✅ Yes (own data) | ✅ Yes (own data) |
| Organization Staff | ✅ Yes (org data) | ❌ No | ❌ No | ✅ Yes (org data) |
| Regular User | ✅ View only | ❌ View only | ❌ No | ✅ View only |

## Security Considerations

1. **Permission Enforcement:** All permission checks are performed on both frontend (UX) and backend (security)
2. **Shared Data Protection:** Only platform admins can modify shared data to maintain data integrity
3. **Verification Status:** Only data owners can set verification status to prevent data tampering
4. **Contact Separation:** Contacts have separate CRUD to maintain clean separation of concerns

## Future Enhancements

1. Add audit logging for shared data changes
2. Add version history for shared data modifications
3. Add bulk verification status updates for platform admins
4. Add notifications when shared data is updated
5. Add approval workflow for verification status changes

## Related Documentation

- `SHARED_COMPANY_PERMISSION_PLAN.md` - Original planning document
- `PLATFORM_ADMIN_PERMISSION_CONSISTENCY.md` - Platform admin permission architecture
- `FEATURES_FUNCTIONS_PERMISSIONS.md` - Complete permission matrix

## Conclusion

All three requirements have been successfully implemented:
1. ✅ Platform admins can edit shared data with full CRUD
2. ✅ Contacts have their own CRUD box, removed from company edit form
3. ✅ Organization owners can set verification status for their data

The implementation follows RBAC best practices and maintains consistency with the existing permission system.
