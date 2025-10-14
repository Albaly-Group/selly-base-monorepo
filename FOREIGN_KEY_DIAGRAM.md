# Foreign Key Relationships Diagram

## Database Schema Overview

This diagram shows the new foreign key relationships added to the `companies` table.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMPANIES TABLE                                │
│─────────────────────────────────────────────────────────────────────────│
│ • id (PK)                                                                │
│ • organization_id (FK → organizations)                                   │
│ • name_en, name_th, name_local                                          │
│ • display_name (GENERATED)                                              │
│ • primary_registration_no                                               │
│                                                                          │
│ NEW FOREIGN KEYS:                                                        │
│ • primary_industry_id (FK → ref_industry_codes.id) ───────────┐        │
│ • primary_region_id (FK → ref_regions.id) ────────────────┐   │        │
│                                                             │   │        │
│ LEGACY FIELDS (for backward compatibility):                │   │        │
│ • industry_classification (JSONB)                          │   │        │
│ • tags (TEXT[])                                            │   │        │
│                                                             │   │        │
│ • address fields, contact info, etc.                       │   │        │
└─────────────────────────────────────────────────────────────┼───┼────────┘
                                                              │   │
                                                              │   │
                ┌─────────────────────────────────────────────┘   │
                │                                                 │
                │                                                 │
                ▼                                                 ▼
┌────────────────────────────────┐        ┌────────────────────────────────┐
│   REF_INDUSTRY_CODES           │        │      REF_REGIONS               │
│────────────────────────────────│        │────────────────────────────────│
│ • id (PK) ◄────────────────────┼────────┼──────────────────┐             │
│ • code                         │        │ • id (PK) ◄──────┼─────────────┤
│ • title_en                     │        │ • code           │             │
│ • title_th                     │        │ • name_en        │             │
│ • description                  │        │ • name_th        │             │
│ • classification_system        │        │ • region_type    │             │
│ • level                        │        │ • country_code   │             │
│ • parent_code                  │        │ • parent_region_id (FK) ──────┘
│ • is_active                    │        │ • is_active                    │
│ • effective_date, end_date     │        │ • created_at                   │
│ • created_at                   │        └────────────────────────────────┘
└────────────────────────────────┘

                                  MANY-TO-MANY RELATIONSHIP

┌─────────────────────────────────────────────────────────────────────────┐
│                          COMPANIES                                       │
│─────────────────────────────────────────────────────────────────────────│
│ • id (PK)                                                                │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ 1:N
                               │
                               ▼
               ┌────────────────────────────────┐
               │      COMPANY_TAGS              │ ← Junction Table
               │────────────────────────────────│
               │ • id (PK)                      │
               │ • company_id (FK) ────────────┐│
               │ • tag_id (FK) ────────────┐   ││
               │ • added_by (FK → users)   │   ││
               │ • added_at                │   ││
               │ UNIQUE(company_id, tag_id)│   ││
               └───────────────────────────┼───┼┘
                                           │   │
                                           │   │
                                      N:1  │   │ N:1
                                           │   │
                                           ▼   │
                        ┌────────────────────────────────┐
                        │         REF_TAGS               │
                        │────────────────────────────────│
                        │ • id (PK) ◄────────────────────┘
                        │ • key (UNIQUE)
                        │ • name
                        │ • description
                        │ • color, icon, category
                        │ • parent_tag_id (FK → ref_tags.id)
                        │ • is_system_tag
                        │ • is_active
                        │ • created_at, updated_at
                        └────────────────────────────────┘
```

## Relationship Types

### 1. Companies → RefIndustryCodes (Many-to-One)
- **Type**: Optional foreign key
- **Cascade**: `ON DELETE SET NULL`
- **Purpose**: Link company to its primary industry classification
- **Example**: Company "ABC Tech" → Industry "Computer programming"

### 2. Companies → RefRegions (Many-to-One)
- **Type**: Optional foreign key
- **Cascade**: `ON DELETE SET NULL`
- **Purpose**: Link company to its primary operating region/province
- **Example**: Company "Bangkok Restaurant" → Region "Bangkok"

### 3. Companies ↔ RefTags (Many-to-Many)
- **Type**: Many-to-many through `company_tags` junction table
- **Cascade**: 
  - Company delete → Cascade delete company_tags
  - Tag delete → Cascade delete company_tags
- **Purpose**: Flexible tagging system for categorization
- **Example**: Company "Startup Ltd" → Tags ["technology", "startup", "saas"]

## Data Flow Examples

### Creating a Company with Foreign Keys

```
Frontend Form              API Request                  Database
─────────────              ───────────                  ────────

[Industry: Computer        POST /companies              INSERT INTO companies
 Programming]              {                            (
                            "companyNameEn": "Tech",     name_en,
[Region: Bangkok]           "primaryIndustryId":         primary_industry_id,
                            "uuid-1",                    primary_region_id
[Tags: tech, startup]       "primaryRegionId":         ) VALUES (
                            "uuid-2"                     'Tech',
                           }                             'uuid-1',  ──┐
                                                        'uuid-2'   ──┼─┐
                                                       )              │ │
                                                                      │ │
                                                       ┌──────────────┘ │
                                                       ▼                 │
                                                    ref_industry_codes  │
                                                    WHERE id = 'uuid-1' │
                                                                         │
                                                       ┌─────────────────┘
                                                       ▼
                                                    ref_regions
                                                    WHERE id = 'uuid-2'

                                                    INSERT INTO company_tags
                                                    (company_id, tag_id)
                                                    SELECT new_company_id, id
                                                    FROM ref_tags
                                                    WHERE key IN ('tech', 'startup')
```

### Querying Companies with Joined Data

```sql
-- Get companies with industry and region names
SELECT 
  c.id,
  c.name_en as company_name,
  i.title_en as industry_name,
  i.title_th as industry_name_th,
  r.name_en as region_name,
  r.name_th as region_name_th,
  ARRAY_AGG(t.name) as tag_names
FROM companies c
LEFT JOIN ref_industry_codes i ON c.primary_industry_id = i.id
LEFT JOIN ref_regions r ON c.primary_region_id = r.id
LEFT JOIN company_tags ct ON c.id = ct.company_id
LEFT JOIN ref_tags t ON ct.tag_id = t.id
WHERE c.organization_id = $1
GROUP BY c.id, i.title_en, i.title_th, r.name_en, r.name_th;
```

### Search and Filter by Foreign Keys

```sql
-- Find all technology companies in Bangkok
SELECT c.*
FROM companies c
JOIN ref_industry_codes i ON c.primary_industry_id = i.id
JOIN ref_regions r ON c.primary_region_id = r.id
WHERE 
  i.classification_system = 'TSIC_2009'
  AND i.code LIKE '62%'  -- Computer programming
  AND r.code = 'TH-10'   -- Bangkok
  AND c.is_shared_data = false;

-- Find companies with specific tags
SELECT DISTINCT c.*
FROM companies c
JOIN company_tags ct ON c.id = ct.company_id
JOIN ref_tags t ON ct.tag_id = t.id
WHERE t.key IN ('startup', 'high_priority')
  AND c.organization_id = $1;
```

## Index Strategy

```
Performance Indexes Created:
═══════════════════════════

companies table:
├─ idx_companies_primary_industry (primary_industry_id)
├─ idx_companies_primary_region (primary_region_id)
└─ (existing indexes for organization_id, name, etc.)

company_tags table:
├─ idx_company_tags_company (company_id)
├─ idx_company_tags_tag (tag_id)
└─ unique constraint on (company_id, tag_id)

ref_industry_codes table:
└─ unique constraint on (code, classification_system)

ref_regions table:
└─ unique constraint on (code, country_code, region_type)

ref_tags table:
└─ unique constraint on (key)
```

## Cascade Behavior

```
┌──────────────────────────────────────────────────────────┐
│ DELETE Operations                                         │
└──────────────────────────────────────────────────────────┘

DELETE ref_industry_codes                DELETE ref_regions
WHERE id = 'uuid-1'                      WHERE id = 'uuid-2'
          │                                       │
          │ ON DELETE SET NULL                    │ ON DELETE SET NULL
          ▼                                       ▼
companies.primary_industry_id = NULL    companies.primary_region_id = NULL
(Company record preserved)              (Company record preserved)


DELETE companies                         DELETE ref_tags
WHERE id = 'company-uuid'                WHERE id = 'tag-uuid'
          │                                       │
          │ ON DELETE CASCADE                     │ ON DELETE CASCADE
          ▼                                       ▼
company_tags records deleted            company_tags records deleted
(All tags removed from company)         (Tag removed from all companies)


DELETE users                            
WHERE id = 'user-uuid'                  
          │                             
          │ ON DELETE SET NULL          
          ▼                             
company_tags.added_by = NULL            
(Audit trail preserved)                 
```

## Migration Flow

```
Step 1: Create Reference Tables (if not exist)
┌───────────────────────────────────────┐
│ CREATE TABLE ref_industry_codes ...  │
│ CREATE TABLE ref_regions ...         │
│ CREATE TABLE ref_tags ...            │
└───────────────────────────────────────┘
                 ├─ Insert sample data
                 └─ Create unique constraints

Step 2: Alter Companies Table
┌───────────────────────────────────────┐
│ ALTER TABLE companies                 │
│   ADD COLUMN primary_industry_id ...  │
│   ADD COLUMN primary_region_id ...    │
└───────────────────────────────────────┘
                 ├─ Create foreign key constraints
                 └─ Create indexes

Step 3: Create Junction Table
┌───────────────────────────────────────┐
│ CREATE TABLE company_tags (           │
│   company_id FK,                      │
│   tag_id FK,                          │
│   UNIQUE(company_id, tag_id)         │
│ )                                     │
└───────────────────────────────────────┘
                 ├─ Create indexes
                 └─ Insert sample relationships

Step 4: Update Sample Data
┌───────────────────────────────────────┐
│ UPDATE companies                      │
│ SET primary_industry_id = ...        │
│ WHERE name_en = ...                   │
└───────────────────────────────────────┘
```

## Benefits Visualization

```
Before (JSONB/Arrays):                  After (Foreign Keys):
═════════════════════                   ══════════════════════

┌─────────────────┐                     ┌─────────────────┐
│ companies       │                     │ companies       │
│─────────────────│                     │─────────────────│
│ industry: JSON  │  ✗ No validation    │ industry_id FK  │  ✓ Validated
│ tags: Array     │  ✗ Duplicates       │                 │  ✓ Normalized
│                 │  ✗ Hard to join     │                 │  ✓ Efficient joins
│                 │  ✗ No referential   │                 │  ✓ Referential
│                 │     integrity       │                 │     integrity
└─────────────────┘                     └─────┬───────────┘
                                              │
                                              ├─→ ref_industry_codes
                                              ├─→ ref_regions
                                              └─→ company_tags → ref_tags

Query Performance:                       Query Performance:
─────────────────                        ─────────────────
WHERE tags @> '["tech"]'  ≈ 100ms       JOIN ref_tags ... ≈ 10ms
(JSONB containment)                      (Indexed foreign key)
```

## Summary

This foreign key implementation provides:

✅ **Data Integrity** - Foreign key constraints ensure valid references
✅ **Performance** - Indexed joins faster than JSONB/array operations  
✅ **Normalization** - Single source of truth for reference data
✅ **Type Safety** - TypeScript types match database relationships
✅ **Flexibility** - Easy to add new industries, regions, tags
✅ **Backward Compatible** - Legacy fields preserved for migration period
✅ **Audit Trail** - Track who added tags via added_by field
