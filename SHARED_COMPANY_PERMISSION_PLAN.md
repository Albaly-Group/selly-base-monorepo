# Shared Company Permission UI Plan

## Requirement
@piriyapol: "If the backend doesn't allow editing some data of a shared company, the frontend should inform the user that they cannot edit shared data, but they can still edit contact and activity logs. Don't let a user without permission fill the form and face an error."

## Backend Permission Logic (Already Exists)
- `apps/api/src/modules/companies/companies.service.ts` line 448-450:
  ```typescript
  if (existingCompany.isSharedData) {
    throw new ForbiddenException('Cannot update shared data companies');
  }
  ```
- Company entity has `isSharedData: boolean` field
- Shared companies can be viewed but not edited
- Contacts and activities CAN still be added to shared companies (different entities)

## Implementation Plan

### 1. Company Detail Drawer Changes
**File:** `apps/web/components/company-detail-drawer.tsx`

#### A. Disable/Hide Edit Button for Shared Companies
- Check `company.isSharedData` 
- If true, either hide the Edit button or show it disabled with tooltip
- Add badge/indicator showing company is shared data

#### B. Add Informational Message
- Display alert/banner at top when viewing shared company
- Message: "This is shared reference data and cannot be edited. You can still add contacts and activities."
- Use info styling (blue/informational, not error red)

### 2. Company Edit Dialog Changes (Defense in Depth)
**File:** `apps/web/components/company-edit-dialog.tsx`

#### A. Add Permission Check
- Check `company.isSharedData` when dialog opens
- Display error message if trying to edit shared company
- Disable submit button
- Add explanation text

### 3. Visual Indicators
- Badge on company name showing "Shared Data" or "Reference Data"
- Info icon with tooltip explaining what shared data means
- Different color scheme for shared companies (subtle)

## Expected User Experience

### For Shared Companies:
1. User opens company detail drawer
2. Sees badge "Shared Reference Data" near company name
3. Sees info banner: "ℹ️ This is shared reference data and cannot be edited. You can still add contacts and activities."
4. Edit button is either:
   - Hidden, OR
   - Disabled with tooltip "Cannot edit shared data"
5. Can still click "Add Contact" and "Log Activity" buttons (these work fine)

### For Non-Shared Companies:
1. Everything works as before
2. No additional messages or restrictions
3. Edit button fully functional

## Implementation Steps
1. ✅ Add shared data badge to company header
2. ✅ Add info banner for shared companies
3. ✅ Conditionally hide/disable Edit button
4. ✅ Add tooltip explaining restriction
5. ✅ Test with both shared and non-shared companies
6. ✅ Ensure contacts and activities still work for shared companies

## Benefits
- ✅ Users informed upfront about restrictions
- ✅ No frustrating form-filling only to see error
- ✅ Clear distinction between what can and can't be edited
- ✅ Better UX with progressive disclosure
- ✅ Contacts and activities clearly still work
