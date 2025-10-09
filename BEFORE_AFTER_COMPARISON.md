# Before/After Comparison: Company Tags Fix

## The Problem

### Error Message
```
[Nest] 30884  - 10/10/2025, 5:10:49 AM   ERROR [AllExceptionsFilter] 
GET /api/v1/companies/search?searchTerm=cp&organizationId=550e8400-e29b-41d4-a716-446655440000&includeSharedData=true&page=1&limit=25
QueryFailedError: column company.tags does not exist
```

### Why It Happened
The code was trying to query `company.tags` directly, but the `companies` table doesn't have a `tags` column. Tags are stored in a separate `company_tags` junction table.

## The Fix

### 1. Tags Search

#### ❌ BEFORE (Incorrect)
```typescript
// Query builder WITHOUT proper joins
const query = this.companyRepository
  .createQueryBuilder('company')
  .leftJoinAndSelect('company.companyContacts', 'companyContacts')
  .leftJoinAndSelect('company.organization', 'organization')
  .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
  .leftJoinAndSelect('company.primaryRegion', 'primaryRegion');

// Trying to search in non-existent column
if (searchTerm) {
  query.andWhere(
    `(
      company.nameEn ILIKE :searchTerm OR 
      company.nameTh ILIKE :searchTerm OR 
      company.displayName ILIKE :searchTerm OR 
      company.businessDescription ILIKE :searchTerm OR
      company.primaryEmail ILIKE :searchTerm OR
      :searchTerm = ANY(company.tags)  // ❌ ERROR: This column doesn't exist!
    )`,
    { searchTerm: `%${searchTerm}%` },
  );
}
```

**Problem**: `company.tags` doesn't exist in the companies table according to the SQL schema.

#### ✅ AFTER (Correct)
```typescript
// Query builder WITH proper joins to tags tables
const query = this.companyRepository
  .createQueryBuilder('company')
  .leftJoinAndSelect('company.companyContacts', 'companyContacts')
  .leftJoinAndSelect('company.organization', 'organization')
  .leftJoinAndSelect('company.primaryIndustry', 'primaryIndustry')
  .leftJoinAndSelect('company.primaryRegion', 'primaryRegion')
  .leftJoin('company.companyTags', 'companyTags')  // ✅ Join to junction table
  .leftJoin('companyTags.tag', 'tag');             // ✅ Join to tags table

// Searching in the proper joined tables
if (searchTerm) {
  query.andWhere(
    `(
      company.nameEn ILIKE :searchTerm OR 
      company.nameTh ILIKE :searchTerm OR 
      company.displayName ILIKE :searchTerm OR 
      company.businessDescription ILIKE :searchTerm OR
      company.primaryEmail ILIKE :searchTerm OR
      tag.key ILIKE :searchTerm OR      // ✅ Search in tag key (from joined table)
      tag.name ILIKE :searchTerm        // ✅ Search in tag name (from joined table)
    )`,
    { searchTerm: `%${searchTerm}%` },
  );
}
```

**Solution**: Properly join with `company_tags` junction table and `ref_tags` table, then search in `tag.key` and `tag.name`.

### 2. Industry Classification Search

#### ❌ BEFORE (Incorrect)
```typescript
if (industrial) {
  // Search in JSONB array for industry classification (legacy support)
  query.andWhere(`company.industryClassification::text ILIKE :industrial`, {
    industrial: `%${industrial}%`,
  });
}
```

**Problem**: `company.industryClassification` doesn't exist in the companies table.

#### ✅ AFTER (Correct)
```typescript
if (industrial) {
  // Search in industry classification via the primaryIndustry relation
  query.andWhere(
    '(primaryIndustry.code ILIKE :industrial OR primaryIndustry.titleEn ILIKE :industrial)',
    {
      industrial: `%${industrial}%`,
    },
  );
}
```

**Solution**: Use the already-joined `primaryIndustry` relation to search in `ref_industry_codes` table.

## Schema Understanding

### Database Tables (from selly-base-optimized-schema.sql)

```sql
-- Companies table - NO tags column
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name_en TEXT NOT NULL,
  primary_industry_id UUID REFERENCES ref_industry_codes(id),
  -- ... other fields
  -- ❌ NO tags column here!
  -- ❌ NO industryClassification column here!
);

-- Tags are in a separate junction table (many-to-many)
CREATE TABLE company_tags (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES ref_tags(id) ON DELETE CASCADE,
  -- ...
);

-- Tag reference data
CREATE TABLE ref_tags (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  -- ...
);

-- Materialized view DOES have tags (for frontend use)
CREATE MATERIALIZED VIEW mv_company_search AS
SELECT 
  c.id,
  c.name_en,
  -- ... other fields
  COALESCE(ct.tags, ARRAY[]::text[]) as tags,  -- ✅ Aggregated from junction table
  -- ...
FROM companies c
LEFT JOIN (
  SELECT ct.company_id, array_agg(t.key ORDER BY t.key) as tags
  FROM company_tags ct
  JOIN ref_tags t ON ct.tag_id = t.id
  WHERE t.is_active = true
  GROUP BY ct.company_id
) ct ON c.id = ct.company_id;
```

### Entity Relationships (TypeORM)

```typescript
// Companies.ts
@Entity('companies')
export class Companies {
  @Column('uuid', { primary: true })
  id: string;

  @Column('text', { name: 'name_en' })
  nameEn: string;

  // ❌ NO tags column property

  // ✅ Relationship to junction table
  @OneToMany(() => CompanyTags, (companyTags) => companyTags.company)
  companyTags: CompanyTags[];
}

// CompanyTags.ts (Junction Table)
@Entity('company_tags')
export class CompanyTags {
  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'tag_id' })
  tagId: string;

  // ✅ Relationship to company
  @ManyToOne(() => Companies, (companies) => companies.companyTags)
  company: Companies;

  // ✅ Relationship to tag
  @ManyToOne(() => RefTags, (refTags) => refTags.companyTags)
  tag: RefTags;
}
```

## Test Changes

### ❌ BEFORE (Incomplete Mock)
```typescript
mockCompanyRepository.createQueryBuilder.mockReturnValue({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  // ❌ Missing leftJoin method
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  // ...
});
```

### ✅ AFTER (Complete Mock)
```typescript
mockCompanyRepository.createQueryBuilder.mockReturnValue({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),  // ✅ Added
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  // ...
});
```

## Results

### Before Fix
```
❌ Search with searchTerm: FAILS with "column company.tags does not exist"
❌ Search with industrial filter: FAILS with "column company.industryClassification does not exist"
```

### After Fix
```
✅ Search with searchTerm: WORKS - searches in company fields AND tag keys/names
✅ Search with industrial filter: WORKS - searches in primaryIndustry code/name
✅ All search-related tests: PASS
✅ No SQL errors
✅ No breaking changes
```

## Key Takeaways

1. **Always Follow the Schema**: The SQL schema file is the master reference
2. **Normalized Design**: Tags and classifications use separate tables, not direct columns
3. **Proper ORM Usage**: Use TypeORM joins to access related table data
4. **Backend vs Frontend**: 
   - Backend queries `companies` table directly (must use joins)
   - Frontend queries `mv_company_search` view (already has aggregated data)
5. **Test Your Mocks**: Ensure test mocks include all methods used in the code

## Impact

- ✅ **Fixed**: Company search functionality now works correctly
- ✅ **No Breaking Changes**: All existing functionality maintained
- ✅ **Better Performance**: Proper joins are more efficient than workarounds
- ✅ **Maintainable**: Code now matches the actual database schema
