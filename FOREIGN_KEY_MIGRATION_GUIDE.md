# Foreign Key Migration Guide

## Overview

This guide documents the migration from text-based location fields (`district`, `subdistrict`, `province`, `countryCode`) to foreign key-based fields (`primaryRegionId`, `primaryIndustryId`) in the company management system.

## What Changed

### Removed Fields (Frontend & Types)
- ❌ `district` - Text field for district name
- ❌ `subdistrict` - Text field for subdistrict name  
- ❌ `province` - Text field for province name
- ❌ `countryCode` - 2-letter country code
- ❌ `industrial` - Text field for industry name (in filters)

### Added Fields
- ✅ `primaryIndustryId` - UUID foreign key to `ref_industry_codes` table
- ✅ `primaryRegionId` - UUID foreign key to `ref_regions` table

## Database Schema

The database schema already follows this pattern:

```sql
CREATE TABLE companies (
  ...
  primary_industry_id UUID REFERENCES ref_industry_codes(id) ON DELETE SET NULL,
  primary_region_id UUID REFERENCES ref_regions(id) ON DELETE SET NULL,
  ...
);
```

Reference tables:
- `ref_industry_codes` - Contains industry classifications (ISIC, TSIC, etc.)
- `ref_regions` - Contains hierarchical region data (country → province → district → subdistrict)

## Frontend Changes

### 1. Company Create Dialog

**Before:**
```tsx
// Text inputs for location
<Input id="district" value={formData.district} />
<Input id="subdistrict" value={formData.subdistrict} />
<Input id="province" value={formData.province} />
<Input id="countryCode" value={formData.countryCode} maxLength={2} />
```

**After:**
```tsx
// Searchable dropdown for region
<Select 
  value={formData.primaryRegionId} 
  onValueChange={(value) => updateField("primaryRegionId", value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select region..." />
  </SelectTrigger>
  <SelectContent>
    {regions.map((region) => (
      <SelectItem key={region.id} value={region.id}>
        {region.name_en} {region.name_th && `(${region.name_th})`}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Searchable dropdown for industry
<Select 
  value={formData.primaryIndustryId} 
  onValueChange={(value) => updateField("primaryIndustryId", value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select industry..." />
  </SelectTrigger>
  <SelectContent>
    {industries.map((industry) => (
      <SelectItem key={industry.id} value={industry.id}>
        {industry.title_en} {industry.title_th && `(${industry.title_th})`}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Loading Reference Data

Forms now load reference data from API endpoints:

```tsx
useEffect(() => {
  if (open) {
    const loadReferenceData = async () => {
      const [industriesData, regionsData] = await Promise.all([
        apiClient.getIndustries({ active: true }),
        apiClient.getRegionsHierarchical({ active: true, countryCode: 'TH' }),
      ])
      setIndustries(industriesData.data || [])
      setRegions(regionsData.data || [])
    }
    loadReferenceData()
  }
}, [open])
```

### 3. Filters Component

**Before:**
```tsx
const provinceOptions = ["Bangkok", "Chiang Mai", "Phuket", ...]
const industrialOptions = ["Manufacturing", "Logistics", ...]
```

**After:**
```tsx
const [industries, setIndustries] = useState([])
const [regions, setRegions] = useState([])

useEffect(() => {
  const loadReferenceData = async () => {
    const [industriesData, regionsData] = await Promise.all([
      apiClient.getIndustries({ active: true }),
      apiClient.getRegionsHierarchical({ active: true, countryCode: 'TH' }),
    ])
    setIndustries(industriesData.data || [])
    setRegions(regionsData.data || [])
  }
  loadReferenceData()
}, [])
```

## Backend API

### Reference Data Endpoints

The following endpoints are available to fetch reference data:

```typescript
// Get all active industries
GET /api/v1/reference-data/industries?active=true

Response:
{
  data: [
    {
      id: "uuid",
      code: "62",
      title_en: "Computer programming",
      title_th: "การเขียนโปรแกรมคอมพิวเตอร์",
      classification_system: "ISIC",
      level: 2
    },
    ...
  ]
}

// Get hierarchical regions (provinces, districts, subdistricts)
GET /api/v1/reference-data/regions/hierarchical?active=true&countryCode=TH

Response:
{
  data: [
    {
      id: "uuid",
      code: "TH-10",
      name_en: "Bangkok",
      name_th: "กรุงเทพมหานคร",
      region_type: "province",
      country_code: "TH",
      children: [
        {
          id: "uuid",
          code: "TH-10-01",
          name_en: "Phra Nakhon",
          name_th: "พระนคร",
          region_type: "district",
          ...
        }
      ]
    },
    ...
  ]
}
```

### Company DTOs

The DTOs already support the foreign key fields:

```typescript
// apps/api/src/dtos/company.dto.ts
export class CreateCompanyDto {
  @ApiProperty({
    description: 'Primary industry ID (foreign key to ref_industry_codes)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryIndustryId?: string;

  @ApiProperty({
    description: 'Primary region ID (foreign key to ref_regions)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryRegionId?: string;
}
```

## TypeScript Types

### CompanyCore Interface

```typescript
// packages/types/src/company.ts
export interface CompanyCore {
  id: string
  // ... other fields
  postalCode?: string | null
  primaryIndustryId?: string | null  // NEW
  primaryRegionId?: string | null    // NEW
  // ... other fields
}
```

### FilterOptions Interface

```typescript
export interface FilterOptions {
  primaryIndustryId?: string  // NEW - UUID of industry
  primaryRegionId?: string    // NEW - UUID of region
  companySize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  // ... other filters
}
```

## Validation Schemas

```typescript
// apps/web/lib/validation-schemas.ts
export const createCompanySchema = z.object({
  // ... other fields
  postalCode: z.string().max(20).optional().or(z.literal('')),
  primaryIndustryId: z
    .string()
    .uuid('Please provide a valid UUID')
    .optional()
    .or(z.literal('')),
  primaryRegionId: z
    .string()
    .uuid('Please provide a valid UUID')
    .optional()
    .or(z.literal('')),
  // ... other fields
})
```

## Backward Compatibility

Display components (table, detail drawer) handle both old and new formats:

```tsx
// Show industry name if available, otherwise show ID
{company.industrialName ? (
  company.industrialName
) : company.primaryIndustryId ? (
  <span className="text-xs text-gray-400">
    ID: {company.primaryIndustryId.substring(0, 8)}...
  </span>
) : (
  '-'
)}
```

## Migration Checklist

For developers updating their code:

- [ ] Update form components to use `primaryIndustryId` and `primaryRegionId`
- [ ] Add reference data loading from API endpoints
- [ ] Replace text inputs with searchable `Select` components
- [ ] Update validation schemas to validate UUIDs
- [ ] Update TypeScript types to use new field names
- [ ] Update filter components to use dynamic API data
- [ ] Test CRUD operations with new foreign key fields
- [ ] Ensure display components show readable names (requires backend joins)

## Backend TODO

To provide better UX, the backend should return joined data:

```typescript
// Example: Companies service should join reference tables
const companies = await this.companiesRepository
  .createQueryBuilder('company')
  .leftJoinAndSelect('company.primaryIndustry', 'industry')
  .leftJoinAndSelect('company.primaryRegion', 'region')
  .getMany()

// Return format with resolved names:
{
  id: "uuid",
  companyNameEn: "Example Corp",
  primaryIndustryId: "uuid",
  primaryIndustry: {
    id: "uuid",
    title_en: "Computer programming",
    title_th: "การเขียนโปรแกรมคอมพิวเตอร์"
  },
  primaryRegionId: "uuid",
  primaryRegion: {
    id: "uuid",
    name_en: "Bangkok",
    name_th: "กรุงเทพมหานคร"
  }
}
```

## Testing

### Manual Testing Steps

1. **Create Company:**
   - Open company create dialog
   - Verify industry and region dropdowns are populated
   - Select values from dropdowns
   - Submit and verify data is saved with UUIDs

2. **Edit Company:**
   - Open company edit dialog
   - Verify current selections are displayed
   - Change industry and/or region
   - Save and verify updates

3. **Filter Companies:**
   - Open filters dropdown
   - Verify dynamic industry and region options
   - Apply filters
   - Verify filtered results

4. **View Company Details:**
   - Open company detail drawer
   - Verify location and industry information displays correctly

## Support

For questions or issues related to this migration:
- Check the existing documentation in `FOREIGN_KEY_README.md`
- Review implementation details in `FOREIGN_KEY_IMPLEMENTATION_GUIDE.md`
- See database relationships in `FOREIGN_KEY_DIAGRAM.md`
