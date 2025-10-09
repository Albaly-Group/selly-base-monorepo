# Backend API Validation Fix

## Issues Identified

Two critical issues were identified in the latest feedback:

1. **Backend API 400 Error**: `property province should not exist`
2. **React Key Warning**: `Encountered two children with the same key, null` in combobox

---

## Issue 1: Backend API Validation Error

### Error Message
```json
{
  "statusCode": 400,
  "timestamp": "2025-10-09T22:55:14.286Z",
  "path": "/api/v1/companies/search?organizationId=550e8400-e29b-41d4-a716-446655440000&includeSharedData=true&page=1&limit=25&industrial=Wholesale+trade&province=Bangkok",
  "method": "GET",
  "message": ["property province should not exist"],
  "error": "Bad Request"
}
```

### Root Cause

The frontend was sending a `province` parameter in the search query, but the backend DTO (`CompanySearchDto`) did not have this field defined. The DTO only accepted:
- `primaryRegionId` (UUID) - for exact region matching
- `industrial` (string) - for industry filtering

But not `province` (string) for province name filtering.

### Solution

#### 1. Added `province` Parameter to DTO

**File:** `apps/api/src/dtos/enhanced-company.dto.ts`

```typescript
@ApiPropertyOptional({
  description: 'Filter by province name',
  example: 'Bangkok',
  maxLength: 200,
})
@IsOptional()
@IsString()
@MaxLength(200)
@Transform(({ value }) => value?.trim())
province?: string;
```

This addition:
- Accepts province name as a string
- Validates it's a string with max 200 characters
- Trims whitespace from the value
- Marks it as optional (not required)
- Documents it in Swagger/OpenAPI

#### 2. Added Province Filtering Logic

**File:** `apps/api/src/modules/companies/companies.service.ts`

**Step 1:** Extract province from searchDto
```typescript
const {
  // ... other fields
  industrial,
  province,  // ← Added
  primaryIndustryId,
  primaryRegionId,
} = searchDto;
```

**Step 2:** Add filtering logic
```typescript
if (province) {
  // Search in province via the primaryRegion relation
  query.andWhere(
    '(primaryRegion.nameEn ILIKE :province OR primaryRegion.nameTh ILIKE :province)',
    {
      province: `%${province}%`,
    },
  );
}
```

This logic:
- Searches in both English (`nameEn`) and Thai (`nameTh`) province names
- Uses `ILIKE` for case-insensitive matching
- Uses `%pattern%` for partial matching (e.g., "Bang" matches "Bangkok")
- Leverages the existing `primaryRegion` join

#### 3. Updated Audit Logging

Added province to the audit log metadata:
```typescript
metadata: {
  filters: {
    // ... other filters
    industrial: searchDto.industrial,
    province: searchDto.province,  // ← Added
    primaryIndustryId: searchDto.primaryIndustryId,
    primaryRegionId: searchDto.primaryRegionId,
  },
  // ...
}
```

### Testing

**Test Case 1: Province Filter**
```bash
GET /api/v1/companies/search?organizationId=xxx&province=Bangkok
```
Expected: 200 OK, returns companies in Bangkok

**Test Case 2: Combined Filters**
```bash
GET /api/v1/companies/search?industrial=Technology&province=Bangkok
```
Expected: 200 OK, returns technology companies in Bangkok

**Test Case 3: Thai Province Name**
```bash
GET /api/v1/companies/search?province=กรุงเทพมหานคร
```
Expected: 200 OK, returns companies in Bangkok (Thai name)

**Test Case 4: Partial Match**
```bash
GET /api/v1/companies/search?province=Chiang
```
Expected: 200 OK, returns companies in "Chiang Mai", "Chiang Rai", etc.

---

## Issue 2: React Key Warning in Combobox

### Error Message
```
Encountered two children with the same key, null. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

components\ui\combobox.tsx (75:17)
```

### Root Cause

The combobox component was using `key={option.value}` for mapping options. When options had empty string values (e.g., "Any Industry" with `value=""`), React interpreted this as a falsy/null key, causing the warning.

**Problematic Code:**
```typescript
{options.map((option) => (
  <CommandItem
    key={option.value}  // ← Empty string becomes null key!
    value={option.value}
    // ...
  >
```

### Solution

Updated the key to use a fallback when the value is empty:

**File:** `apps/web/components/ui/combobox.tsx`

```typescript
{options.map((option, index) => (
  <CommandItem
    key={option.value || `option-${index}`}  // ← Fallback to index-based key
    value={option.value}
    onSelect={(currentValue) => {
      onValueChange?.(currentValue === value ? '' : currentValue)
      setOpen(false)
    }}
  >
```

**Why This Works:**
- When `option.value` is truthy (non-empty), it's used as the key
- When `option.value` is falsy (empty string, null, undefined), falls back to `option-${index}`
- Each option gets a unique key
- React can properly track component identity

**Example:**
```typescript
// Option with value
{ value: "technology", label: "Technology" }
// Key: "technology"

// Option with empty value
{ value: "", label: "Any Industry" }
// Key: "option-0"
```

### Testing

1. Open Smart Filtering Panel
2. Open Industry dropdown (has "Any Industry" with empty value)
3. Check browser console
4. Expected: No React key warnings ✅

---

## Impact

### Before Fix
- ❌ Backend returns 400 error for province parameter
- ❌ Cannot filter by province name
- ❌ React console shows key warnings
- ❌ Combobox component unstable with empty values

### After Fix
- ✅ Backend accepts province parameter
- ✅ Can filter by province name (English or Thai)
- ✅ No React console warnings
- ✅ Combobox stable with all value types
- ✅ Better user experience
- ✅ More flexible filtering options

---

## API Contract

### Request
```
GET /api/v1/companies/search
```

### Query Parameters (Updated)
```typescript
{
  organizationId?: string         // UUID
  includeSharedData?: boolean     // true/false
  page?: number                   // 1-N
  limit?: number                  // 1-100
  
  // Filtering parameters
  industrial?: string             // e.g., "Technology", "Manufacturing"
  province?: string               // e.g., "Bangkok", "กรุงเทพมหานคร" ← NEW!
  companySize?: string           // e.g., "small", "medium", "large"
  verificationStatus?: string    // e.g., "verified", "unverified"
  
  // ID-based filters
  primaryIndustryId?: string     // UUID
  primaryRegionId?: string       // UUID
}
```

### Response
```json
{
  "data": [
    {
      "id": "uuid",
      "nameEn": "Company Name",
      "province": "Bangkok",
      "industrialName": "Technology",
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Database Query

### Before (Only primaryRegionId)
```sql
SELECT * FROM companies c
LEFT JOIN ref_regions r ON c.primary_region_id = r.id
WHERE c.primary_region_id = '550e8400-e29b-41d4-a716-446655440002'
```

This required knowing the exact UUID of the region.

### After (province parameter support)
```sql
SELECT * FROM companies c
LEFT JOIN ref_regions r ON c.primary_region_id = r.id
WHERE (r.name_en ILIKE '%Bangkok%' OR r.name_th ILIKE '%Bangkok%')
```

This allows natural language queries by province name.

---

## Files Modified

### Backend (2 files)
1. `apps/api/src/dtos/enhanced-company.dto.ts`
   - Added `province` field with validation
   
2. `apps/api/src/modules/companies/companies.service.ts`
   - Added province parameter extraction
   - Added province filtering logic
   - Updated audit logging

### Frontend (1 file)
1. `apps/web/components/ui/combobox.tsx`
   - Fixed key prop to handle empty values

---

## Backward Compatibility

### API Changes
✅ **Fully Backward Compatible**
- New `province` parameter is optional
- Existing API calls without `province` work unchanged
- No breaking changes to existing functionality

### Frontend Changes
✅ **Fully Backward Compatible**
- Combobox still works with all existing implementations
- Empty values now handled better
- No breaking changes to component API

---

## Related Documentation

- See `DROPDOWN_PARAMETER_FIX.md` for the previous fix (handling "Any" selections)
- See `ISSUE_FIXES_SUMMARY.md` for the original implementation
- See `CHANGES_VISUAL_GUIDE.md` for visual comparisons

---

## Commit

**Commit Hash:** `9f2bdb7`
**Commit Message:** Fix backend API validation error and combobox key warning

**Changes:**
- Added province parameter to backend DTO and service
- Fixed combobox key warning for empty values
- Updated audit logging to include province

---

## Conclusion

Both issues have been completely resolved:

1. ✅ Backend now properly accepts and processes `province` parameter
2. ✅ Frontend combobox handles empty values without key warnings
3. ✅ Users can filter companies by province name
4. ✅ No more validation errors
5. ✅ Clean browser console
6. ✅ Production ready

The smart filtering feature is now fully functional with proper backend API integration.
