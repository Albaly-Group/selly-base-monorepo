# API Field Mapping Update - Frontend to Backend Alignment

## Issue
Frontend types were using snake_case field names while backend TypeORM entities use camelCase, causing type mismatches when consuming API responses.

## Root Cause
TypeORM entities (`RefIndustryCodes`, `RefRegions`) define properties in camelCase:
```typescript
@Column('text', { name: 'title_en' })
titleEn: string;  // Property name in camelCase

@Column('text', { name: 'name_en' })
nameEn: string;   // Property name in camelCase
```

When TypeORM serializes these entities to JSON for API responses, it uses the **property name** (camelCase), not the database column name (snake_case).

## Solution
Updated all frontend TypeScript types to match the backend camelCase format.

## Field Name Changes

### IndustryCode Interface
| Old (snake_case) | New (camelCase) |
|------------------|-----------------|
| `title_en` | `titleEn` |
| `title_th` | `titleTh` |
| `classification_system` | `classificationSystem` |
| `is_active` | `isActive` |
| `effective_date` | `effectiveDate` |
| `end_date` | `endDate` |

### Region Interface
| Old (snake_case) | New (camelCase) |
|------------------|-----------------|
| `name_en` | `nameEn` |
| `name_th` | `nameTh` |
| `region_type` | `regionType` |
| `country_code` | `countryCode` |
| `parent_region_id` | `parentRegionId` |
| `is_active` | `isActive` |

## Files Modified

### Type Definitions
- `packages/types/src/company.ts` - Core type definitions

### Frontend Components
- `apps/web/components/company-table.tsx` - Table display and sorting
- `apps/web/components/company-detail-drawer.tsx` - Detail view with bilingual labels
- `apps/web/components/company-create-dialog.tsx` - Create form dropdowns
- `apps/web/components/company-edit-dialog.tsx` - Edit form dropdowns
- `apps/web/components/company-filters.tsx` - Filter dropdown display

### Documentation
- `JOINED_DATA_IMPLEMENTATION.md` - Usage examples and API format documentation

## API Response Example

### Before (Expected but Wrong)
```json
{
  "primaryIndustry": {
    "title_en": "Manufacturing",
    "title_th": "การผลิต"
  }
}
```

### After (Actual Backend Response)
```json
{
  "primaryIndustry": {
    "titleEn": "Manufacturing",
    "titleTh": "การผลิต",
    "classificationSystem": "TSIC_2009",
    "isActive": true
  }
}
```

## Usage Pattern

All components use a consistent fallback pattern for backward compatibility:

```typescript
// Industry display
const industryName = 
  company.industrialName ||              // Legacy field
  company.primaryIndustry?.titleEn ||    // New joined data
  (company.primaryIndustryId ? `ID: ${company.primaryIndustryId.substring(0, 8)}...` : '-');

// Region display
const regionName = 
  company.province ||                    // Legacy field
  company.primaryRegion?.nameEn ||       // New joined data
  (company.primaryRegionId ? `ID: ${company.primaryRegionId.substring(0, 8)}...` : '-');
```

## Validation

✅ TypeScript compilation successful
✅ Next.js build successful
✅ ESLint passed for all modified files
✅ CodeQL security scan passed (0 vulnerabilities)
✅ No breaking changes (backward compatible)

## Benefits

1. **Type Safety**: Frontend types now accurately match backend API responses
2. **Better DX**: IntelliSense and type checking work correctly
3. **Consistency**: Follows JavaScript/TypeScript naming conventions (camelCase)
4. **No Breaking Changes**: Legacy fields still work via fallback chain
5. **Future-Proof**: Aligns with TypeORM and NestJS conventions

## Related Documentation

- See `JOINED_DATA_IMPLEMENTATION.md` for implementation details
- Backend entities: `apps/api/src/entities/RefIndustryCodes.ts` and `RefRegions.ts`
- Backend DTOs: `apps/api/src/dtos/reference-data.dto.ts`
