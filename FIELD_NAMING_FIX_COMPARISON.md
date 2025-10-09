# Before/After Comparison - API Field Naming Fix

## Visual Comparison

### TypeScript Type Definitions

#### Before (Incorrect - snake_case)
```typescript
export interface IndustryCode {
  id: string
  code: string
  title_en: string                    // ❌ Wrong
  title_th?: string | null            // ❌ Wrong
  classification_system: string        // ❌ Wrong
  is_active?: boolean | null          // ❌ Wrong
  effective_date?: string | null      // ❌ Wrong
  end_date?: string | null            // ❌ Wrong
}

export interface Region {
  id: string
  code: string
  name_en: string                     // ❌ Wrong
  name_th?: string | null             // ❌ Wrong
  region_type: string                 // ❌ Wrong
  country_code: string                // ❌ Wrong
  parent_region_id?: string | null    // ❌ Wrong
  is_active?: boolean | null          // ❌ Wrong
}
```

#### After (Correct - camelCase)
```typescript
export interface IndustryCode {
  id: string
  code: string
  titleEn: string                     // ✅ Correct
  titleTh?: string | null             // ✅ Correct
  classificationSystem: string        // ✅ Correct
  isActive?: boolean | null           // ✅ Correct
  effectiveDate?: string | null       // ✅ Correct
  endDate?: string | null             // ✅ Correct
  createdAt?: string | null           // ✅ New
  updatedAt?: string | null           // ✅ New
}

export interface Region {
  id: string
  code: string
  nameEn: string                      // ✅ Correct
  nameTh?: string | null              // ✅ Correct
  regionType: string                  // ✅ Correct
  countryCode: string                 // ✅ Correct
  parentRegionId?: string | null      // ✅ Correct
  isActive?: boolean | null           // ✅ Correct
  createdAt?: string | null           // ✅ New
  updatedAt?: string | null           // ✅ New
}
```

---

### Component Usage

#### Before (Incorrect)
```tsx
// ❌ Would cause runtime errors - properties don't exist
<div>{company.primaryIndustry?.title_en}</div>
<div>{company.primaryRegion?.name_en}</div>

// Sorting would fail
companies.sort((a, b) => {
  const aName = a.primaryIndustry?.title_en || '';  // ❌ undefined
  const bName = b.primaryIndustry?.title_en || '';  // ❌ undefined
  return aName.localeCompare(bName);
});
```

#### After (Correct)
```tsx
// ✅ Works correctly with actual API response
<div>{company.primaryIndustry?.titleEn}</div>
<div>{company.primaryRegion?.nameEn}</div>

// Sorting works correctly
companies.sort((a, b) => {
  const aName = a.primaryIndustry?.titleEn || '';   // ✅ Gets actual value
  const bName = b.primaryIndustry?.titleEn || '';   // ✅ Gets actual value
  return aName.localeCompare(bName);
});
```

---

### API Response (What Backend Actually Returns)

```json
{
  "id": "abc123",
  "companyNameEn": "Example Corp",
  "primaryIndustryId": "21cb1421-37fd-4357-a408-49a9135ffc22",
  "primaryIndustry": {
    "id": "21cb1421-37fd-4357-a408-49a9135ffc22",
    "code": "46",
    "titleEn": "Wholesale trade",           // ✅ camelCase (not title_en)
    "titleTh": "การขายส่ง",                 // ✅ camelCase (not title_th)
    "classificationSystem": "TSIC_2009",    // ✅ camelCase
    "level": 2,
    "isActive": true,                       // ✅ camelCase
    "effectiveDate": null,
    "endDate": null,
    "createdAt": "2025-10-09T22:13:29.665Z",
    "updatedAt": "2025-10-09T22:51:02.645Z"
  },
  "primaryRegionId": "1097cb6f-a6fb-4607-9a98-94ce22610289",
  "primaryRegion": {
    "id": "1097cb6f-a6fb-4607-9a98-94ce22610289",
    "code": "TH-10",
    "nameEn": "Bangkok",                    // ✅ camelCase (not name_en)
    "nameTh": "กรุงเทพมหานคร",              // ✅ camelCase (not name_th)
    "regionType": "province",               // ✅ camelCase
    "countryCode": "TH",                    // ✅ camelCase
    "isActive": true,
    "createdAt": "2025-10-09T22:13:29.665Z",
    "updatedAt": "2025-10-09T22:13:29.665Z"
  }
}
```

---

## Why This Happened

### TypeORM Entity Definition (Backend)
```typescript
@Entity('ref_industry_codes')
export class RefIndustryCodes {
  @Column('text', { name: 'title_en' })  // Database column: title_en
  titleEn: string;                       // Property name: titleEn ✅
  
  @Column('text', { name: 'title_th' })  // Database column: title_th
  titleTh: string | null;                // Property name: titleTh ✅
}
```

**Key Point**: TypeORM uses the **property name** (camelCase) when serializing to JSON, not the database column name (snake_case).

---

## Impact Analysis

### Before Fix
❌ **Runtime Errors**: Frontend would access undefined properties
❌ **Type Mismatches**: TypeScript wouldn't catch the errors
❌ **Display Issues**: Industry and region names wouldn't display
❌ **Sorting Broken**: Sorting by industry/region would fail
❌ **Filter Broken**: Filter labels would show undefined

### After Fix
✅ **Type Safety**: TypeScript catches any mistakes at compile time
✅ **Correct Display**: All industry and region names display properly
✅ **Working Sorts**: Sorting by industry/region works correctly
✅ **Working Filters**: Filter labels display correct names
✅ **IntelliSense**: IDE autocomplete shows correct property names

---

## Testing Checklist

- [x] TypeScript compilation passes
- [x] Next.js build succeeds
- [x] ESLint passes for modified files
- [x] CodeQL security scan passes
- [x] No breaking changes (backward compatible with legacy fields)
- [x] Backend API already uses camelCase (verified in DTOs and entities)

---

## Backward Compatibility

The fix maintains backward compatibility through fallback chains:

```typescript
// Will work with old data, new data, or missing data
const displayName = 
  company.industrialName ||              // Old legacy field
  company.primaryIndustry?.titleEn ||    // New correct field
  company.primaryIndustryId ||           // Fallback to ID
  '-';                                   // Final fallback
```

This ensures:
- ✅ Old code with legacy fields continues to work
- ✅ New code with joined data works correctly
- ✅ Missing data shows graceful fallbacks
- ✅ No user-facing errors or blank displays
