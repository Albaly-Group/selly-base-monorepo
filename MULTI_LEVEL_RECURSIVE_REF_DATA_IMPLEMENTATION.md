# Multi-Level Recursive Reference Data Implementation

## Overview

This document describes the comprehensive implementation of multi-level recursive/hierarchical data support for reference tables (`ref_industry_codes`, `ref_regions`, `ref_tags`) across the entire application stack.

## Problem Statement

Previously, reference tables had inconsistent support for hierarchical relationships:
- `ref_industry_codes` used `parent_code` (TEXT) instead of proper foreign key relationships
- Missing CRUD operations for managing hierarchical data
- No frontend utilities for displaying and managing hierarchies
- Inconsistent schema across reference tables

## Solution Implemented

### 1. SQL Schema Updates

**File**: `selly-base-optimized-schema.sql`

#### ref_industry_codes
- **Changed**: `parent_code TEXT` → `parent_id UUID REFERENCES ref_industry_codes(id)`
- **Added**: `updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`
- **Benefit**: Proper foreign key constraint ensures referential integrity and enables cascading operations

```sql
CREATE TABLE ref_industry_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_th TEXT,
  description TEXT,
  classification_system TEXT NOT NULL,
  level INTEGER NOT NULL,
  parent_id UUID REFERENCES ref_industry_codes(id),  -- Changed from parent_code
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,   -- Added
  UNIQUE(code, classification_system)
);
```

#### ref_regions
- **Added**: `updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`
- **Already had**: `parent_region_id UUID REFERENCES ref_regions(id)`

```sql
CREATE TABLE ref_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_th TEXT,
  region_type TEXT NOT NULL CHECK (region_type IN ('country', 'province', 'district', 'subdistrict')),
  country_code TEXT NOT NULL,
  parent_region_id UUID REFERENCES ref_regions(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,   -- Added
  UNIQUE(code, country_code, region_type)
);
```

#### ref_tags
- **Already had**: `parent_tag_id UUID REFERENCES ref_tags(id)`
- **Already had**: `updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`

### 2. Backend Entity Updates

**Files**: 
- `apps/api/src/entities/RefIndustryCodes.ts`
- `apps/api/src/entities/RefRegions.ts`
- `apps/api/src/entities/RefTags.ts`

All entities now have proper TypeORM relationships:

```typescript
// Example from RefIndustryCodes
@ManyToOne(
  () => RefIndustryCodes,
  (refIndustryCodes) => refIndustryCodes.refIndustryCodes,
)
@JoinColumn([{ name: 'parent_id', referencedColumnName: 'id' }])
parent: RefIndustryCodes;

@OneToMany(
  () => RefIndustryCodes,
  (refIndustryCodes) => refIndustryCodes.parent,
)
refIndustryCodes: RefIndustryCodes[];
```

**Benefits**:
- Bi-directional relationships for easy navigation
- TypeORM automatically loads related entities
- Type-safe access to parent and children

### 3. Backend DTOs

**File**: `apps/api/src/dtos/reference-data.dto.ts`

Created comprehensive DTOs for all CRUD operations:
- `CreateIndustryCodeDto` / `UpdateIndustryCodeDto`
- `CreateRegionDto` / `UpdateRegionDto`
- `CreateTagDto` / `UpdateTagDto`

Each DTO includes:
- Validation decorators (`@IsString`, `@IsUUID`, `@IsOptional`, etc.)
- API documentation (`@ApiProperty`)
- Parent ID field for establishing hierarchical relationships

### 4. Backend Service Methods

**File**: `apps/api/src/modules/reference-data/reference-data.service.ts`

Implemented full CRUD operations for all three ref tables:

#### Industry Codes
- `createIndustryCode(dto)` - Create with parent validation
- `getIndustryCodeById(id)` - Get single with relations
- `getIndustryCodesHierarchical()` - Get all with parent/children
- `updateIndustryCode(id, dto)` - Update with parent validation
- `deleteIndustryCode(id)` - Delete with children check

#### Regions
- `createRegion(dto)` - Create with parent validation
- `getRegionById(id)` - Get single with relations
- `getRegionsHierarchical()` - Get all with parent/children
- `updateRegion(id, dto)` - Update with parent validation
- `deleteRegion(id)` - Delete with children check

#### Tags
- `createTag(dto)` - Create with parent validation
- `getTagById(id)` - Get single with relations
- `getTagsHierarchical()` - Get all with parent/children
- `updateTag(id, dto)` - Update with parent validation
- `deleteTag(id)` - Delete with children check (prevents deletion of system tags)

**Key Features**:
- Parent existence validation before creation/update
- Circular reference prevention (cannot set parent to self)
- Children check before deletion (prevents orphaning)
- System tag protection (cannot delete system tags)

### 5. Backend API Endpoints

**File**: `apps/api/src/modules/reference-data/reference-data.controller.ts`

#### Industry Codes Endpoints
```
POST   /api/v1/reference-data/industry-codes           - Create
GET    /api/v1/reference-data/industry-codes/:id       - Get one
GET    /api/v1/reference-data/industry-codes/hierarchical - Get all with hierarchy
PUT    /api/v1/reference-data/industry-codes/:id       - Update
DELETE /api/v1/reference-data/industry-codes/:id       - Delete
```

#### Regions Endpoints
```
POST   /api/v1/reference-data/regions                  - Create
GET    /api/v1/reference-data/regions/:id              - Get one
GET    /api/v1/reference-data/regions/hierarchical     - Get all with hierarchy
PUT    /api/v1/reference-data/regions/:id              - Update
DELETE /api/v1/reference-data/regions/:id              - Delete
```

#### Tags Endpoints
```
POST   /api/v1/reference-data/tags                     - Create
GET    /api/v1/reference-data/tags/:id                 - Get one
GET    /api/v1/reference-data/tags/hierarchical        - Get all with hierarchy
PUT    /api/v1/reference-data/tags/:id                 - Update
DELETE /api/v1/reference-data/tags/:id                 - Delete
GET    /api/v1/reference-data/tags                     - Get simple list
```

All endpoints include:
- Swagger/OpenAPI documentation
- Query parameters for filtering (active status, country code, etc.)
- Proper HTTP status codes
- Error handling with descriptive messages

### 6. Frontend API Client

**File**: `apps/web/lib/api-client.ts`

Added type-safe methods for all CRUD operations:

```typescript
// Industry Codes
createIndustryCode(data): Promise<any>
getIndustryCodesHierarchical(params?): Promise<{ data: any[] }>
getIndustryCodeById(id): Promise<any>
updateIndustryCode(id, data): Promise<any>
deleteIndustryCode(id): Promise<{ message: string }>

// Regions
createRegion(data): Promise<any>
getRegionsHierarchical(params?): Promise<{ data: any[] }>
getRegionById(id): Promise<any>
updateRegion(id, data): Promise<any>
deleteRegion(id): Promise<{ message: string }>

// Tags
createTag(data): Promise<any>
getTagsHierarchical(params?): Promise<{ data: any[] }>
getTagById(id): Promise<any>
updateTag(id, data): Promise<any>
deleteTag(id): Promise<{ message: string }>
getTags(params?): Promise<{ data: any[] }>
```

### 7. Frontend Hierarchy Utilities

**File**: `apps/web/lib/hierarchy-utils.ts`

Created comprehensive utility functions for working with hierarchical data:

#### Tree Operations
- `buildTree(items)` - Convert flat list to tree structure
- `flattenTree(tree)` - Convert tree back to flat list with levels

#### Navigation
- `getAncestors(item, allItems)` - Get parent, grandparent, etc.
- `getDescendants(item)` - Get children, grandchildren, etc.
- `getBreadcrumb(item, allItems)` - Get full path as string array

#### Display
- `formatHierarchicalName(item, showLevel)` - Format with indentation
- `filterHierarchical(items, searchTerm)` - Search through hierarchy

## Usage Examples

### Creating a Hierarchical Industry Code

```typescript
// Create parent category
const parent = await apiClient.createIndustryCode({
  code: 'MFG',
  titleEn: 'Manufacturing',
  titleTh: 'การผลิต',
  classificationSystem: 'ISIC',
  level: 1,
  isActive: true
});

// Create child category
const child = await apiClient.createIndustryCode({
  code: 'MFG-AUTO',
  titleEn: 'Automotive Manufacturing',
  titleTh: 'การผลิตยานยนต์',
  classificationSystem: 'ISIC',
  level: 2,
  parentId: parent.id,  // Link to parent
  isActive: true
});
```

### Fetching and Displaying Hierarchical Data

```typescript
// Fetch all industry codes with hierarchy
const response = await apiClient.getIndustryCodesHierarchical({ active: true });
const industryCodes = response.data;

// Build tree structure
import { buildTree, formatHierarchicalName } from '@/lib/hierarchy-utils';
const tree = buildTree(industryCodes);

// Display as indented list
const flatList = flattenTree(tree);
flatList.forEach(item => {
  console.log(formatHierarchicalName(item));
});

// Output:
// Manufacturing
//   └─ Automotive Manufacturing
//   └─ Electronics Manufacturing
```

### Searching Through Hierarchy

```typescript
import { filterHierarchical } from '@/lib/hierarchy-utils';

const filtered = filterHierarchical(industryCodes, 'automotive');
// Returns all matching items plus their ancestors for context
```

### Getting Breadcrumb Path

```typescript
import { getBreadcrumb } from '@/lib/hierarchy-utils';

const breadcrumb = getBreadcrumb(childItem, allItems);
// Returns: ['Manufacturing', 'Automotive Manufacturing']
```

## Frontend Integration Examples

### Select Component with Hierarchy

```tsx
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { buildTree, formatHierarchicalName } from '@/lib/hierarchy-utils';

function IndustrySelect() {
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    async function loadIndustries() {
      const response = await apiClient.getIndustryCodesHierarchical();
      const tree = buildTree(response.data);
      const flat = flattenTree(tree);
      setIndustries(flat);
    }
    loadIndustries();
  }, []);

  return (
    <select>
      {industries.map(industry => (
        <option key={industry.id} value={industry.id}>
          {formatHierarchicalName(industry)}
        </option>
      ))}
    </select>
  );
}
```

### Tree View Component

```tsx
import { buildTree } from '@/lib/hierarchy-utils';

function TreeView({ items }) {
  const tree = buildTree(items);

  function renderNode(node, level = 0) {
    const indent = '  '.repeat(level);
    return (
      <div key={node.id}>
        <div style={{ paddingLeft: `${level * 20}px` }}>
          {node.nameEn || node.titleEn}
        </div>
        {node.children?.map(child => renderNode(child, level + 1))}
      </div>
    );
  }

  return (
    <div>
      {tree.map(root => renderNode(root))}
    </div>
  );
}
```

## Benefits

### Data Integrity
- Foreign key constraints prevent invalid parent references
- Cannot delete items with children (prevents orphaning)
- Cannot set circular references (parent to self)
- Type-safe relationships in TypeORM

### Developer Experience
- Comprehensive API documentation in Swagger
- Type-safe API client methods
- Reusable utility functions for common operations
- Consistent patterns across all three ref tables

### User Experience
- Can display data as flat list or tree structure
- Breadcrumb navigation shows full path
- Search works through entire hierarchy
- Indentation visually shows relationships

### Maintainability
- Single source of truth (SQL schema)
- Consistent CRUD patterns across all tables
- Well-documented with examples
- Easy to extend to additional ref tables

## Migration Notes

If you have existing data with `parent_code` in `ref_industry_codes`, you'll need to migrate it:

```sql
-- Add new column
ALTER TABLE ref_industry_codes ADD COLUMN parent_id UUID;

-- Populate parent_id from parent_code
UPDATE ref_industry_codes ic1
SET parent_id = ic2.id
FROM ref_industry_codes ic2
WHERE ic1.parent_code = ic2.code
  AND ic1.classification_system = ic2.classification_system;

-- Drop old column
ALTER TABLE ref_industry_codes DROP COLUMN parent_code;

-- Add foreign key constraint
ALTER TABLE ref_industry_codes 
ADD CONSTRAINT fk_parent_industry_code 
FOREIGN KEY (parent_id) REFERENCES ref_industry_codes(id);
```

## Testing

### Manual Testing Checklist

**Industry Codes:**
- [ ] Create root-level industry code
- [ ] Create child industry code with parent
- [ ] Update industry code parent reference
- [ ] Try to create circular reference (should fail)
- [ ] Try to delete industry code with children (should fail)
- [ ] Delete leaf industry code (should succeed)
- [ ] Fetch hierarchical list
- [ ] Verify parent/children relationships are correct

**Regions:**
- [ ] Create country-level region
- [ ] Create province with country as parent
- [ ] Create district with province as parent
- [ ] Create subdistrict with district as parent
- [ ] Update region parent reference
- [ ] Try to create circular reference (should fail)
- [ ] Try to delete region with children (should fail)
- [ ] Delete leaf region (should succeed)
- [ ] Fetch hierarchical list filtered by country
- [ ] Verify 4-level hierarchy works correctly

**Tags:**
- [ ] Create root-level tag
- [ ] Create child tag with parent
- [ ] Update tag parent reference
- [ ] Try to create circular reference (should fail)
- [ ] Try to delete system tag (should fail)
- [ ] Try to delete tag with children (should fail)
- [ ] Delete leaf tag (should succeed)
- [ ] Fetch hierarchical list
- [ ] Verify tag categories work with hierarchy

### API Testing with curl

```bash
# Create parent industry code
curl -X POST http://localhost:3001/api/v1/reference-data/industry-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "MFG",
    "titleEn": "Manufacturing",
    "classificationSystem": "ISIC",
    "level": 1
  }'

# Create child industry code
curl -X POST http://localhost:3001/api/v1/reference-data/industry-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "MFG-AUTO",
    "titleEn": "Automotive Manufacturing",
    "classificationSystem": "ISIC",
    "level": 2,
    "parentId": "PARENT_UUID_HERE"
  }'

# Get hierarchical list
curl http://localhost:3001/api/v1/reference-data/industry-codes/hierarchical

# Update industry code
curl -X PUT http://localhost:3001/api/v1/reference-data/industry-codes/UUID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Updated Title"
  }'

# Delete industry code
curl -X DELETE http://localhost:3001/api/v1/reference-data/industry-codes/UUID_HERE
```

## Future Enhancements

1. **Batch Operations**: Import/export hierarchical data
2. **Drag-and-Drop UI**: Reorder and reparent items visually
3. **Permission Control**: Restrict who can modify ref data
4. **Audit Trail**: Track changes to hierarchical structure
5. **Soft Delete**: Allow undoing deletions
6. **Validation Rules**: Custom rules per hierarchy level
7. **Localization**: Full multi-language support
8. **Performance**: Materialized paths for faster queries

## Conclusion

This implementation provides a solid foundation for managing multi-level recursive reference data throughout the application. The SQL schema ensures data integrity, the backend provides comprehensive CRUD operations with validation, and the frontend utilities make it easy to display and work with hierarchical data.
