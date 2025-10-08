# Activity CRUD Fix Plan

## Issues Identified

### 1. Backend: Activity Service Returns Wrapper Object
**File:** `apps/api/src/modules/company-activities/company-activities.service.ts`
**Line:** 99
**Issue:** Returns `{ savedActivity }` instead of properly formatted response
**Same issue as contacts**

### 2. Frontend: Activities Not Fetched or Displayed
**File:** `apps/web/components/company-detail-drawer.tsx`
**Issue:** 
- Activities are commented out in the UI (line 535)
- No state for activities
- No fetch on drawer open
- No refresh after creating activity
- Same pattern as the contact fix

### 3. Other Services Scanned
**Status:** ✅ No other services have the `{ saved... }` wrapper issue
- company-lists.service.ts - No CRUD operations with this pattern
- Other services checked - Clean

## Fix Plan

### Phase 1: Backend Fix
1. Update `company-activities.service.ts`
   - Fix `createActivity()` to return properly formatted data
   - Match the pattern used in contact fix
   - Return all activity fields directly

### Phase 2: Frontend Fix - Activity State & Fetching
1. Update `company-detail-drawer.tsx`
   - Add `activities` and `isLoadingActivities` state
   - Fetch activities when drawer opens (same as contacts)
   - Display activities in Activity tab
   - Refresh activities after creating new activity

### Phase 3: Frontend Fix - Activity Display
1. Update `company-detail-drawer.tsx`
   - Uncomment and implement activity display
   - Show loading state
   - Show empty state
   - Display activity cards with proper formatting

## Implementation Order
1. ✅ Fix backend service (createActivity response)
2. ✅ Add activity state management
3. ✅ Implement activity fetching
4. ✅ Add activity display UI
5. ✅ Add refresh after create

## Expected Results
- Activities save properly to DB ✅
- Activities display immediately after creation ✅
- Loading and empty states work ✅
- Consistent with contact CRUD implementation ✅
