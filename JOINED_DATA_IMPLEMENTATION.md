# Joined Foreign Key Data Implementation

## Overview

Enhanced the companies API to return joined data with resolved names from reference tables (`ref_industry_codes` and `ref_regions`), providing better UX by displaying readable names instead of UUIDs.

## Implementation

### Backend Changes

Updated `apps/api/src/modules/companies/companies.service.ts` to include joins in all company queries:

```typescript
// Added to all query builders
.leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
.leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
```

**Methods Updated:**
1. `searchCompaniesFromDatabase()` - Company search with filters
2. `getCompanyByIdFromDatabase()` - Single company retrieval
3. `updateCompany()` - Company update (reloads with relations)
4. `createCompany()` - Company creation (reloads with relations)
5. `getCompaniesByIds()` - Bulk company retrieval

### Frontend Changes

Updated display components to show resolved names:

**Files Modified:**
1. `apps/web/components/company-table.tsx`
   - Industry column shows `primaryIndustry.titleEn`
   - Region column shows `primaryRegion.nameEn`
   - Updated sorting to use resolved names

2. `apps/web/components/company-detail-drawer.tsx`
   - Shows industry and region with bilingual labels
   - Format: `Bangkok (กรุงเทพมหานคร)`

3. `packages/types/src/company.ts`
   - Added `IndustryCode` interface
   - Added `Region` interface
   - Updated `CompanyCore` with optional nested objects

## API Response Format

### Before
```json
{
  "id": "abc-123",
  "companyNameEn": "Example Corp",
  "primaryIndustryId": "industry-uuid",
  "primaryRegionId": "region-uuid"
}
```

### After
```json
{
  "id": "abc-123",
  "companyNameEn": "Example Corp",
  "primaryIndustryId": "industry-uuid",
  "primaryIndustry": {
    "id": "industry-uuid",
    "code": "62",
    "titleEn": "Computer programming",
    "titleTh": "การเขียนโปรแกรมคอมพิวเตอร์",
    "classificationSystem": "ISIC",
    "level": 2,
    "isActive": true
  },
  "primaryRegionId": "region-uuid",
  "primaryRegion": {
    "id": "region-uuid",
    "code": "TH-10",
    "nameEn": "Bangkok",
    "nameTh": "กรุงเทพมหานคร",
    "regionType": "province",
    "countryCode": "TH",
    "isActive": true
  }
}
```

## TypeScript Types

### New Interfaces

```typescript
export interface IndustryCode {
  id: string
  code: string
  titleEn: string
  titleTh?: string | null
  description?: string | null
  classificationSystem: string
  level: number
  isActive?: boolean | null
  effectiveDate?: string | null
  endDate?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface Region {
  id: string
  code: string
  nameEn: string
  nameTh?: string | null
  regionType: 'country' | 'province' | 'district' | 'subdistrict'
  countryCode: string
  parentRegionId?: string | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}
```

### Updated CompanyCore

```typescript
export interface CompanyCore {
  // ... existing fields
  primaryIndustryId?: string | null
  primaryRegionId?: string | null
  primaryIndustry?: IndustryCode | null  // NEW
  primaryRegion?: Region | null          // NEW
  // ... rest of fields
}
```

## Display Logic

Components use a fallback chain for maximum compatibility:

### Industry Display
1. Check `company.industrialName` (legacy)
2. Check `company.primaryIndustry?.titleEn` (joined data)
3. Fallback to truncated `company.primaryIndustryId`
4. Show "-" if nothing available

### Region Display
1. Check `company.province` (legacy)
2. Check `company.primaryRegion?.nameEn` (joined data)
3. Fallback to truncated `company.primaryRegionId`
4. Show "-" if nothing available

## Benefits

### Performance
✅ Single query retrieves all data (no N+1 problem)
✅ Efficient database joins using foreign key indexes
✅ No additional API calls needed

### User Experience
✅ Readable names instead of UUIDs
✅ Bilingual support (English/Thai)
✅ Immediate data availability
✅ Consistent display across all views

### Developer Experience
✅ Type-safe nested objects
✅ No manual data fetching required
✅ Automatic joins on all queries
✅ Backward compatible with legacy code

### Data Integrity
✅ Data comes directly from reference tables
✅ Always up-to-date with current reference data
✅ No stale cached names
✅ Referential integrity maintained

## Usage Examples

### Frontend Display

```tsx
// Simple display
{company.primaryIndustry?.titleEn}

// With fallback
{company.primaryIndustry?.titleEn || 'Unknown Industry'}

// Bilingual display
{company.primaryRegion?.nameEn}
{company.primaryRegion?.nameTh && ` (${company.primaryRegion.nameTh})`}

// Full fallback chain
{company.primaryIndustry?.titleEn || 
 (company.primaryIndustryId ? `ID: ${company.primaryIndustryId.substring(0, 8)}...` : '-')}
```

### Sorting

```typescript
// Sort by industry name
companies.sort((a, b) => {
  const aName = a.primaryIndustry?.titleEn || '';
  const bName = b.primaryIndustry?.titleEn || '';
  return aName.localeCompare(bName);
});
```

## Affected Endpoints

All company endpoints now return joined data:

- `GET /api/v1/companies/search` - Search with filters
- `GET /api/v1/companies/:id` - Get single company
- `POST /api/v1/companies` - Create company
- `PUT /api/v1/companies/:id` - Update company
- `POST /api/v1/companies/bulk` - Bulk retrieval

## Migration Notes

### For Existing Code

No migration required! The implementation is fully backward compatible:

1. **IDs Still Present**: `primaryIndustryId` and `primaryRegionId` still included
2. **Nested Objects Optional**: `primaryIndustry` and `primaryRegion` are optional
3. **Legacy Fields Work**: Old `industrialName` and `province` still function
4. **Graceful Degradation**: Code works even if nested objects are null

### For New Code

Recommended pattern:

```typescript
// Always check for nested object first
const industryName = company.primaryIndustry?.titleEn || 
                     company.industrialName || 
                     'Not specified';

const regionName = company.primaryRegion?.nameEn || 
                   company.province || 
                   'Not specified';
```

## Testing

### Verification Checklist

- [x] Backend builds successfully
- [x] TypeScript types compile without errors
- [x] Joins execute efficiently (no N+1 queries)
- [x] Frontend displays resolved names
- [x] Fallback logic works for null values
- [x] Bilingual display functions correctly
- [x] Legacy data still displays properly
- [x] No breaking changes to existing endpoints

### Manual Testing

1. Create company with industry and region
2. Verify response includes nested objects
3. Check table display shows names not UUIDs
4. Open detail view and verify bilingual labels
5. Test with companies missing foreign keys
6. Verify sorting works with resolved names

## Performance Impact

### Database
- **Query Impact**: Minimal - uses indexed foreign keys
- **Response Size**: Slightly larger (nested objects)
- **Query Time**: Negligible increase with proper indexes

### Frontend
- **API Calls**: Reduced (no separate lookups needed)
- **Rendering**: Same (just displaying different fields)
- **Type Checking**: Improved (better TypeScript inference)

## Future Enhancements

Potential improvements for the future:

1. **Caching**: Add Redis cache for reference data
2. **GraphQL**: Use GraphQL for selective field loading
3. **Lazy Loading**: Option to exclude joins for list views
4. **Localization**: Use user's language preference for labels
5. **Hierarchical Display**: Show full region hierarchy (country > province > district)

## Support

For questions or issues:
- See `FOREIGN_KEY_MIGRATION_GUIDE.md` for migration details
- Check `FOREIGN_KEY_IMPLEMENTATION_GUIDE.md` for backend guide
- Review `FOREIGN_KEY_README.md` for original implementation

## Commits

- Backend: `51aaa89` - Add joined data for primaryIndustry and primaryRegion
- Frontend: `e222021` - Update frontend to display resolved names
