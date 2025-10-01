# Entity Usage Guide - Developer Reference

**Last Updated**: October 1, 2025  
**Status**: ✅ Backend Operational

## Quick Start - Which Entities Should I Use?

### ✅ USE THESE ENTITIES (Match SQL Schema)

When developing features, **ALWAYS** import and use these entities:

```typescript
// Import from the entities index
import { 
  Organization,     // organizations table
  User,            // users table
  Role,            // roles table
  UserRole,        // user_roles table
  Company,         // companies table
  CompanyList,     // company_lists table
  CompanyListItem, // company_list_items table
  AuditLog,        // audit_logs table
  ExportJob,       // export_jobs table
  ImportJob        // import_jobs table
} from '../../entities';
```

### ❌ DO NOT USE THESE (Legacy/Mismatched)

These entities exist in the codebase but **should not be used** for new development:

```typescript
// ❌ Don't import these
import { 
  Users,                              // Duplicate of User (plural)
  Roles,                              // Duplicate of Role (plural)
  UserRoles,                          // Duplicate of UserRole (plural)
  CommonCompanyLists,                 // No matching SQL table
  CommonCompanyClassifications,       // No matching SQL table
  CommonCompanyContacts,              // No matching SQL table
  CommonCompanyRegistrations,         // No matching SQL table
  CommonCompanyShareholdersNationality, // No matching SQL table
  CommonCompanyTags,                  // No matching SQL table
  LeadListingImports,                 // No matching SQL table
  LeadListingImportRows,              // No matching SQL table
  LeadListingProjects,                // No matching SQL table
  // ... other legacy entities
} from '../../entities';
```

## Entity-to-Table Mapping

### Core Multi-Tenant Entities

| Entity Class | SQL Table | Purpose | Relations |
|--------------|-----------|---------|-----------|
| `Organization` | `organizations` | Tenant/customer organization | Has many Users |
| `User` | `users` | User accounts | Belongs to Organization, Has many UserRoles, Has many CompanyLists |
| `Role` | `roles` | Role definitions | Has many UserRoles |
| `UserRole` | `user_roles` | User-role assignments | Belongs to User, Role, Organization |

### Company Management

| Entity Class | SQL Table | Purpose | Relations |
|--------------|-----------|---------|-----------|
| `Company` | `companies` | Company/business records | Belongs to Organization |
| `CompanyList` | `company_lists` | User-created company lists | Belongs to Organization, User; Has many CompanyListItems |
| `CompanyListItem` | `company_list_items` | Companies in a list | Belongs to CompanyList, Company, User |

### Audit & Job Tracking

| Entity Class | SQL Table | Purpose | Relations |
|--------------|-----------|---------|-----------|
| `AuditLog` | `audit_logs` | Activity audit trail | Belongs to Organization, User |
| `ExportJob` | `export_jobs` | Data export tracking | Belongs to Organization, User |
| `ImportJob` | `import_jobs` | Data import tracking | Belongs to Organization, User |

## Usage Examples

### Creating a New Company

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, Organization } from '../../entities'; // ✅ Correct imports

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(data: any, organizationId: string) {
    const company = this.companyRepository.create({
      nameEn: data.name,
      organizationId: organizationId,
      // ... other fields
    });
    return await this.companyRepository.save(company);
  }
}
```

### Querying with Relations

```typescript
// Get user with their organization and roles
const user = await userRepository.findOne({
  where: { id: userId },
  relations: ['organization', 'roles', 'roles.role'],
});

// Get company list with items
const list = await companyListRepository.findOne({
  where: { id: listId },
  relations: ['items', 'items.company', 'ownerUser'],
});
```

### Important Field Names

Entity fields use **camelCase** to match SQL column snake_case:

```typescript
// Company entity
company.nameEn          // maps to name_en
company.nameTh          // maps to name_th
company.displayName     // maps to display_name (generated)
company.organizationId  // maps to organization_id
company.primaryEmail    // maps to primary_email

// User entity
user.organizationId     // maps to organization_id
user.passwordHash       // maps to password_hash
user.avatarUrl          // maps to avatar_url
user.lastLoginAt        // maps to last_login_at
user.emailVerifiedAt    // maps to email_verified_at

// CompanyList entity
list.ownerUserId        // maps to owner_user_id
list.totalCompanies     // maps to total_companies
list.isSmartList        // maps to is_smart_list
list.lastActivityAt     // maps to last_activity_at
```

## Generated/Read-Only Columns

Some columns are **generated by PostgreSQL** and should **not** be set manually:

### Company Entity
```typescript
// ❌ Don't do this:
company.displayName = "Some Name";

// ✅ Do this instead:
company.nameEn = "English Name";
company.nameTh = "Thai Name";
// displayName is automatically generated as COALESCE(nameEn, nameTh)

// Also read-only:
company.searchVector  // Generated by PostgreSQL for full-text search
```

### All Entities with Timestamps
```typescript
// These are set automatically:
entity.createdAt  // Set on INSERT
entity.updatedAt  // Set on INSERT and UPDATE
```

## Module Setup

### Correct Module Configuration

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Organization, User } from '../../entities'; // ✅ Correct
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Organization, User])
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
```

### ❌ Wrong Module Configuration

```typescript
// ❌ Don't use legacy entities:
import { CommonCompanyLists, Users } from '../../entities';
TypeOrmModule.forFeature([CommonCompanyLists, Users])
```

## Database Configuration

The database config loads entities from the correct path:

```typescript
// apps/api/src/config/database.config.ts
entities: [__dirname + '/../entities/*{.ts,.js}'],
```

This loads ALL entity files from the `entities/` directory. Make sure you're importing the correct ones!

## Testing

### Correct Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company, User, Organization } from '../../entities'; // ✅ Correct

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: Repository<Company>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get(getRepositoryToken(Company));
  });
  
  // ... tests
});
```

## Common Pitfalls

### 1. Using Wrong Entity Name

```typescript
// ❌ Wrong - imports legacy entity
import { Users } from '../../entities';
const users = await this.usersRepository.find();

// ✅ Correct - imports current entity
import { User } from '../../entities';
const users = await this.userRepository.find();
```

### 2. Setting Generated Fields

```typescript
// ❌ Wrong - displayName is generated
const company = this.companyRepository.create({
  displayName: "My Company",
});

// ✅ Correct - set source fields
const company = this.companyRepository.create({
  nameEn: "My Company",
});
// displayName is automatically computed
```

### 3. Wrong Field Names

```typescript
// ❌ Wrong - using snake_case
company.name_en = "Test";
company.organization_id = "123";

// ✅ Correct - using camelCase
company.nameEn = "Test";
company.organizationId = "123";
```

### 4. Missing Relations in TypeORM Module

```typescript
// ❌ Wrong - only importing one entity when you need relations
@Module({
  imports: [TypeOrmModule.forFeature([Company])],
})

// Then trying to use Organization in the service will fail

// ✅ Correct - import all entities you'll use
@Module({
  imports: [TypeOrmModule.forFeature([Company, Organization, User])],
})
```

## Migration from Legacy Code

If you find code using legacy entities:

### Step 1: Identify the Legacy Entity

```typescript
// Found in old code:
import { CommonCompanyLists } from '../../entities';
```

### Step 2: Find the Correct Entity

Check the SQL_ENTITY_MISMATCH_REPORT.md or use this guide:
- `CommonCompanyLists` → Use `Company` instead
- `Users` → Use `User` instead  
- `Roles` → Use `Role` instead
- `UserRoles` → Use `UserRole` instead

### Step 3: Update Imports and Usage

```typescript
// Before:
import { CommonCompanyLists, Users } from '../../entities';
const company = await commonCompanyListsRepo.findOne(...);

// After:
import { Company, User } from '../../entities';
const company = await companyRepo.findOne(...);
```

### Step 4: Update Field Names if Needed

The legacy entities might have different field names. Check the entity definition.

## Future Development

### When to Create New Entities

Create a new entity file when:
1. Adding a new table to the SQL schema
2. The table will be actively used by backend features
3. You've updated the migration to create the table

### Entity Creation Checklist

- [ ] Table exists in `selly-base-optimized-schema.sql`
- [ ] Migration creates the table
- [ ] Entity class name is singular PascalCase (e.g., `Company`, not `Companies`)
- [ ] Entity file name matches class name (e.g., `Company.ts`)
- [ ] Table name in `@Entity()` decorator matches SQL (e.g., `"companies"`)
- [ ] All columns defined with correct types
- [ ] Generated columns marked as `insert: false, update: false`
- [ ] Relations properly defined
- [ ] Entity exported from `entities/index.ts`
- [ ] Documentation updated

### SQL Tables Reserved for Future Use

These SQL tables exist but **don't have entities yet**:
- `company_registrations` - Multiple registration tracking
- `company_contacts` - Contact information  
- `lead_projects` - Lead generation project management
- `lead_project_companies` - Project associations
- `lead_project_tasks` - Project tasks
- `ref_industry_codes` - Industry classifications
- `ref_regions` - Geographic reference data
- `user_activity_logs` - Activity tracking

**Don't create entities for these unless the feature is being implemented.**

## Getting Help

### Questions About Entity Usage?

1. Check this guide first
2. Check `ENTITY_ALIGNMENT_FIX.md` for technical details
3. Check `SQL_ENTITY_MISMATCH_REPORT.md` for mismatch information
4. Review the SQL schema: `selly-base-optimized-schema.sql`
5. Check the migration: `apps/api/src/database/migrations/1735601000000-InitialSchema.ts`

### Found a Bug or Mismatch?

1. Verify against SQL schema (source of truth)
2. Check if using correct entity (not legacy)
3. Document in SQL_ENTITY_MISMATCH_REPORT.md
4. Create an issue with details

## Summary

**Golden Rules**:
1. ✅ Use singular entity names: `User`, `Company`, `Role`
2. ❌ Don't use plural names: `Users`, `Companies`, `Roles`
3. ❌ Don't use "Common" prefix: `CommonCompanyLists`
4. ✅ Import from: `'../../entities'` or `'@/entities'`
5. ✅ Check SQL schema when in doubt
6. ✅ Use camelCase for entity fields, they map to snake_case columns

**Current Status**: Backend is operational with correct entities matching SQL schema. Legacy entities are deprecated but not yet removed.

---

**For Backend Developers**: Follow this guide to ensure you're using the correct entities.  
**For New Contributors**: Start with this guide before writing any database code.
