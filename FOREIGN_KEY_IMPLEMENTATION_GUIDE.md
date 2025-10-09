# Foreign Key Implementation Guide

This document describes the new foreign key relationships added to the `companies` table and how to use them in both backend and frontend applications.

## Overview

Three new foreign key columns have been added to the `companies` table to establish proper relationships with reference data tables:

1. **`primary_industry_id`** → References `ref_industry_codes(id)`
2. **`primary_region_id`** → References `ref_regions(id)`
3. **`company_tags`** → Many-to-many junction table linking companies to `ref_tags`

These changes improve data integrity and enable better querying and filtering capabilities.

## Database Schema Changes

### New Columns in `companies` Table

```sql
-- Foreign key references to reference data tables
primary_industry_id UUID REFERENCES ref_industry_codes(id) ON DELETE SET NULL,
primary_region_id UUID REFERENCES ref_regions(id) ON DELETE SET NULL,

-- Legacy fields for backward compatibility
industry_classification JSONB DEFAULT '{}',
tags TEXT[] DEFAULT '{}',
```

### New Junction Table: `company_tags`

```sql
CREATE TABLE company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES ref_tags(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, tag_id)
);
```

## Backend API Changes

### Updated DTOs

All company DTOs (`CreateCompanyDto`, `UpdateCompanyDto`, `CompanySearchDto`) now include optional fields for the new foreign keys:

```typescript
@ApiPropertyOptional({
  description: 'Primary industry ID (foreign key to ref_industry_codes)',
  example: '550e8400-e29b-41d4-a716-446655440001',
})
@IsOptional()
@IsUUID(4, { message: 'Invalid UUID' })
primaryIndustryId?: string;

@ApiPropertyOptional({
  description: 'Primary region ID (foreign key to ref_regions)',
  example: '550e8400-e29b-41d4-a716-446655440002',
})
@IsOptional()
@IsUUID(4, { message: 'Invalid UUID' })
primaryRegionId?: string;
```

### CompaniesService Updates

The `CompaniesService` has been updated to handle the new foreign key fields in both `createCompany` and `updateCompany` methods.

#### Creating a Company with Foreign Keys

```typescript
const createData = {
  companyNameEn: 'Example Company Ltd.',
  primaryIndustryId: '550e8400-e29b-41d4-a716-446655440001',
  primaryRegionId: '550e8400-e29b-41d4-a716-446655440002',
  // ... other fields
};

const company = await companiesService.createCompany(createData, user);
```

#### Updating a Company's Foreign Keys

```typescript
const updateData = {
  primaryIndustryId: 'new-industry-uuid',
  primaryRegionId: 'new-region-uuid',
};

const updatedCompany = await companiesService.updateCompany(
  companyId,
  updateData,
  user
);
```

## Frontend Integration

### Fetching Reference Data

Before using the foreign key fields in forms, fetch the available options from the reference data endpoints:

```typescript
import { apiClient } from '@/lib/api-client';

// Fetch industries
const fetchIndustries = async () => {
  try {
    const response = await apiClient.getIndustries();
    return response.data.map(industry => ({
      value: industry.id,
      label: industry.title_en,
      labelTh: industry.title_th,
    }));
  } catch (error) {
    console.error('Failed to fetch industries:', error);
    return [];
  }
};

// Fetch regions
const fetchRegions = async () => {
  try {
    const response = await apiClient.getRegions();
    return response.data.map(region => ({
      value: region.id,
      label: region.name_en,
      labelTh: region.name_th,
    }));
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
};

// Fetch tags
const fetchTags = async () => {
  try {
    const response = await apiClient.getTags();
    return response.data.map(tag => ({
      value: tag.id,
      label: tag.name,
      description: tag.description,
      color: tag.color,
    }));
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
};
```

### Adding Foreign Keys to Company Forms

#### Example: Company Create Dialog

```typescript
// Add state for foreign keys
const [formData, setFormData] = useState({
  companyNameEn: '',
  companyNameTh: '',
  primaryIndustryId: '',
  primaryRegionId: '',
  // ... other fields
});

// Add state for reference data
const [industries, setIndustries] = useState([]);
const [regions, setRegions] = useState([]);

// Fetch reference data on mount
useEffect(() => {
  const loadReferenceData = async () => {
    const [industriesData, regionsData] = await Promise.all([
      fetchIndustries(),
      fetchRegions(),
    ]);
    setIndustries(industriesData);
    setRegions(regionsData);
  };
  loadReferenceData();
}, []);

// Add select fields in the form
<div className="space-y-2">
  <Label htmlFor="primaryIndustryId">Industry</Label>
  <Select
    value={formData.primaryIndustryId}
    onValueChange={(value) =>
      setFormData({ ...formData, primaryIndustryId: value })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select industry" />
    </SelectTrigger>
    <SelectContent>
      {industries.map((industry) => (
        <SelectItem key={industry.value} value={industry.value}>
          {industry.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="primaryRegionId">Region</Label>
  <Select
    value={formData.primaryRegionId}
    onValueChange={(value) =>
      setFormData({ ...formData, primaryRegionId: value })
    }
  >
    <SelectTrigger>
      <SelectValue placeholder="Select region" />
    </SelectTrigger>
    <SelectContent>
      {regions.map((region) => (
        <SelectItem key={region.value} value={region.value}>
          {region.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Working with Company Tags

For tags, use the many-to-many relationship through the `company_tags` table:

```typescript
// Add tags to a company
const addTagsToCompany = async (companyId: string, tagIds: string[]) => {
  try {
    // This would be a new API endpoint to add tags
    await apiClient.addCompanyTags(companyId, { tagIds });
  } catch (error) {
    console.error('Failed to add tags:', error);
  }
};

// Remove tags from a company
const removeTagsFromCompany = async (companyId: string, tagIds: string[]) => {
  try {
    await apiClient.removeCompanyTags(companyId, { tagIds });
  } catch (error) {
    console.error('Failed to remove tags:', error);
  }
};

// Get company tags
const getCompanyTags = async (companyId: string) => {
  try {
    const response = await apiClient.getCompanyTags(companyId);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch company tags:', error);
    return [];
  }
};
```

## Search and Filtering

The new foreign keys can be used for filtering in search queries:

```typescript
const searchParams = {
  searchTerm: 'technology',
  primaryIndustryId: '550e8400-e29b-41d4-a716-446655440001',
  primaryRegionId: '550e8400-e29b-41d4-a716-446655440002',
  page: 1,
  limit: 50,
};

const results = await apiClient.searchCompanies(searchParams);
```

## Backward Compatibility

The legacy fields (`industry_classification` as JSONB and `tags` as TEXT[]) are still maintained for backward compatibility. However, new implementations should use the foreign key relationships for better data integrity and query performance.

## Migration Notes

When running the database migration, the following will happen:

1. New foreign key columns are added to the `companies` table
2. The `company_tags` junction table is created
3. Reference data tables (`ref_industry_codes`, `ref_regions`, `ref_tags`) are created if they don't exist
4. Sample data is inserted to demonstrate the relationships
5. Indexes are created for optimal query performance

## Testing

To test the new foreign key relationships:

1. Verify that the migration runs successfully
2. Test creating a company with foreign key references
3. Test updating a company's foreign keys
4. Test that cascade deletes work correctly
5. Test searching and filtering by the new foreign keys

## Reference Data Endpoints

Make sure the following API endpoints are available:

- `GET /api/reference-data/industries` - List all industry codes
- `GET /api/reference-data/regions` - List all regions
- `GET /api/reference-data/tags` - List all tags
- `POST /api/companies/:id/tags` - Add tags to a company
- `DELETE /api/companies/:id/tags` - Remove tags from a company
- `GET /api/companies/:id/tags` - Get company tags

## Benefits

1. **Data Integrity**: Foreign keys ensure that only valid references exist
2. **Better Queries**: Join queries are more efficient than JSONB searches
3. **Normalization**: Reduces data redundancy
4. **Referential Integrity**: Automatic cascade handling on deletes
5. **Type Safety**: TypeScript interfaces match database schema

## Support

For questions or issues, please refer to:
- API Documentation: `/apps/api/API_DOCUMENTATION_NEW_ENDPOINTS.md`
- Dropdown Integration: `/DROPDOWN_API_DOCUMENTATION.md`
- Entity Usage Guide: `/ENTITY_USAGE_GUIDE.md`
