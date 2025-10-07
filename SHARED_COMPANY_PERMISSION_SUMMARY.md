# Shared Company Permission UI Implementation Summary

## Requirement
@piriyapol: "If the backend doesn't allow editing some data of a shared company, the frontend should inform the user that they cannot edit shared data, but they can still edit contact and activity logs. Don't let a user without permission fill the form and face an error."

## Problem
- Backend already has permission logic that prevents editing shared companies (`isSharedData === true`)
- Frontend did not check this permission before allowing users to open edit dialog
- Users could fill the entire form only to get an error when submitting
- No visual indication that a company is shared reference data
- Unclear that contacts and activities can still be added to shared companies

## Solution Implemented

### 1. Company Detail Drawer Changes
**File:** `apps/web/components/company-detail-drawer.tsx`

#### A. Added Shared Data Badge
- Display "Shared Reference Data" badge next to company name
- Blue styling to indicate informational status (not error)
- Only shows when `company.isSharedData === true`

```typescript
{company.isSharedData && (
  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
    Shared Reference Data
  </Badge>
)}
```

#### B. Conditional Edit Button
- Edit button disabled for shared companies
- Tooltip explains "Cannot edit shared reference data"
- Button still visible but clearly not clickable

```typescript
{!company.isSharedData ? (
  <Button onClick={() => setShowEditDialog(true)}>
    <Edit className="h-4 w-4 mr-1" />
    <span className="hidden sm:inline">Edit</span>
  </Button>
) : (
  <Button disabled title="Cannot edit shared reference data">
    <Edit className="h-4 w-4 mr-1" />
    <span className="hidden sm:inline">Edit</span>
  </Button>
)}
```

#### C. Informational Banner
- Blue info banner displayed at top of content area
- Clear message: "This company is from a shared data source and cannot be edited."
- Explicitly states: "You can still add contacts and log activities."
- Uses AlertCircle icon for visibility

```typescript
{company.isSharedData && (
  <div className="mt-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-800">
      <p className="font-medium">Shared Reference Data</p>
      <p className="text-blue-700 mt-1">
        This company is from a shared data source and cannot be edited. 
        You can still add contacts and log activities.
      </p>
    </div>
  </div>
)}
```

### 2. Company Edit Dialog Changes (Defense in Depth)
**File:** `apps/web/components/company-edit-dialog.tsx`

#### A. Warning Alert
- Red alert banner if dialog somehow opens for shared company
- Clear error message explaining the restriction
- Instructs user to close the dialog

```typescript
{company?.isSharedData && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-red-800">
      <p className="font-medium">Cannot Edit Shared Data</p>
      <p className="text-red-700 mt-1">
        This company is from a shared data source and cannot be edited. 
        Please close this dialog.
      </p>
    </div>
  </div>
)}
```

#### B. Disabled Form Fields
- All input fields disabled when `company?.isSharedData === true`
- Fields are grayed out and not editable
- Prevents any data entry attempt

#### C. Disabled Submit Button
- "Save Changes" button disabled for shared companies
- Cancel button changes to "Close" for clarity
- Prevents submission attempt

```typescript
<Button onClick={handleSubmit} disabled={isLoading || success || company?.isSharedData}>
  {isLoading ? "Saving..." : success ? "Saved!" : "Save Changes"}
</Button>
```

## User Experience Flow

### For Shared Companies:
1. **User opens company detail drawer**
   - Sees "Shared Reference Data" badge on company header
   - Sees blue info banner explaining restrictions
   - Edit button is disabled with tooltip

2. **User understands restrictions immediately**
   - No need to try clicking Edit button
   - Clear message that contacts and activities CAN be added
   - No frustration from filling forms that can't be submitted

3. **User can still add value**
   - "Add Contact" button fully functional
   - "Log Activity" button fully functional
   - Can add company to lists
   - Can view all company information

4. **If edit dialog somehow opens (edge case)**
   - Red alert banner explains the issue
   - All fields disabled
   - Submit button disabled
   - User can only close the dialog

### For Non-Shared Companies:
1. Everything works as before
2. No additional restrictions or messages
3. Edit button fully functional
4. All features work normally

## Visual Design Decisions

### Color Coding:
- **Blue** for informational messages (shared data banner in detail drawer)
  - Not an error, just information
  - Friendly and informative tone
  
- **Red** for error/restriction in edit dialog
  - Shouldn't be there anyway (defense in depth)
  - Clear "stop" signal

### Badge Placement:
- Shared data badge near company name
- Same visual level as verification status
- Immediately visible when viewing company

### Message Clarity:
- Explicit about what CAN'T be done (edit company data)
- Explicit about what CAN be done (add contacts and activities)
- No ambiguity or confusion

## Backend Permission Logic (Already Exists)

The backend already enforces this permission at line 448-450 of `companies.service.ts`:

```typescript
if (existingCompany.isSharedData) {
  throw new ForbiddenException('Cannot update shared data companies');
}
```

Our frontend changes prevent users from ever hitting this error by:
1. Disabling UI controls upfront
2. Informing users of restrictions
3. Providing clear guidance on what they CAN do

## Benefits

1. ✅ **Better UX** - Users know restrictions upfront
2. ✅ **No Wasted Effort** - Don't fill forms they can't submit
3. ✅ **Clear Communication** - Explicit about what can and can't be done
4. ✅ **Prevents Frustration** - No surprise errors after form filling
5. ✅ **Maintains Functionality** - Contacts and activities still work
6. ✅ **Progressive Disclosure** - Shows information when relevant
7. ✅ **Defense in Depth** - Multiple layers of protection

## Testing

- ✅ All packages build successfully
- ✅ TypeScript compilation passes
- ✅ No build errors or warnings
- ✅ UI gracefully handles shared companies
- ✅ Non-shared companies unaffected
- ✅ Contacts and activities work for both types

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Shared Data Visibility** | ❌ No indication | ✅ Badge + Banner |
| **Edit Button** | ✅ Always clickable | ✅ Disabled for shared |
| **User Awareness** | ❌ None upfront | ✅ Informed immediately |
| **Form Filling** | ❌ Can fill then get error | ✅ Form disabled |
| **Contacts/Activities** | ✅ Work but unclear | ✅ Work + explicitly stated |
| **Error Experience** | ❌ After submission | ✅ Prevented entirely |

## Future Enhancements (Optional)

- Add tooltip on shared data badge explaining what "shared reference data" means
- Add data source information in company details (show it's from DBD registry, etc.)
- Differentiate between different types of shared data sources
- Add analytics to track how often users encounter shared data restrictions

## Related Files

- `apps/web/components/company-detail-drawer.tsx` - Main UI with permissions
- `apps/web/components/company-edit-dialog.tsx` - Edit dialog with restrictions
- `apps/api/src/modules/companies/companies.service.ts` - Backend permission logic (existing)
- `packages/types/src/company.ts` - Company type with isSharedData field

**Status:** ✅ Complete and Production Ready
**Commit:** (to be added)
