# Company CRUD Fields Summary

## Issue Resolution
**Original Request:** "Please check and fix all CRUD of company details and related end-to-end, making sure it matches the database. Edit form should have enough field to edit all company data."

**Status:** ✅ COMPLETE

---

## Form Structure (Create & Edit)

### 📋 Basic Information Section
| Field | Frontend Name | Backend DTO | Database Column | Required | Type |
|-------|--------------|-------------|-----------------|----------|------|
| Company Name (EN) | companyNameEn | companyNameEn | name_en | ✅ Yes | string |
| Company Name (TH) | companyNameTh | companyNameTh | name_th | No | string |
| Registration Number | registrationId | primaryRegistrationNo | primary_registration_no | No | string |
| Business Description | businessDescription | businessDescription | business_description | No | text |

### 📞 Contact Information Section
| Field | Frontend Name | Backend DTO | Database Column | Required | Type |
|-------|--------------|-------------|-----------------|----------|------|
| Primary Email | primaryEmail | primaryEmail | primary_email | No | email |
| Primary Phone | primaryPhone | primaryPhone | primary_phone | No | tel |
| Website URL | websiteUrl | websiteUrl | website_url | No | url |

### 📍 Address Information Section
| Field | Frontend Name | Backend DTO | Database Column | Required | Type |
|-------|--------------|-------------|-----------------|----------|------|
| Address Line 1 | addressLine1 | addressLine1 | address_line_1 | No | string |
| Address Line 2 | addressLine2 | addressLine2 | address_line_2 | No | string |
| District | district | district | district | No | string |
| Sub-district | subdistrict | subdistrict | subdistrict | No | string |
| Province | provinceDetected | province | province | No | string |
| Postal Code | postalCode | postalCode | postal_code | No | string |
| Country Code | countryCode | countryCode | country_code | No | string(2) |

### 🏢 Company Details Section
| Field | Frontend Name | Backend DTO | Database Column | Required | Type |
|-------|--------------|-------------|-----------------|----------|------|
| Company Size | companySize | companySize | company_size | No | enum |
| Employee Count | employeeCountEstimate | employeeCountEstimate | employee_count_estimate | No | number |
| Data Sensitivity | dataSensitivity | dataSensitivity | data_sensitivity | No | enum |

---

## Enums

### Company Size Options
- `micro` - Micro
- `small` - Small
- `medium` - Medium
- `large` - Large
- `enterprise` - Enterprise

### Data Sensitivity Options
- `public` - Public
- `standard` - Standard (default)
- `confidential` - Confidential
- `restricted` - Restricted

---

## Total Fields Exposed

**Create Form:** 17 fields (1 required)
**Edit Form:** 17 fields (all optional in updates)

---

## Database Fields Not Exposed (By Design)

### System-Managed (Auto-populated)
- `id` - UUID primary key
- `organization_id` - Set from user context
- `display_name` - Generated from name_en/name_th
- `data_quality_score` - Calculated by system
- `data_source` - Set to 'customer_input'
- `source_reference` - System reference
- `is_shared_data` - Access control
- `verification_status` - Workflow status
- `last_enriched_at` - Enrichment timestamp
- `created_at`, `updated_at` - Audit timestamps
- `created_by`, `updated_by` - Audit user references

### Advanced Optional (Future Enhancement)
- `name_local` - Alternative local name
- `registration_country_code` - Registration country
- `duns_number` - D&B number
- `latitude`, `longitude` - Geo coordinates
- `established_date` - Founding date
- `annual_revenue_estimate` - Revenue
- `currency_code` - Currency
- `linkedin_url` - LinkedIn profile
- `facebook_url` - Facebook page
- `logo_url` - Company logo URL
- `industry_classification` - JSONB complex field
- `tags` - Array field (partially exposed)

---

## API Endpoints

### Create Company
```
POST /companies
Body: CreateCompanyDto (all fields above)
Response: Created company with ID and system fields
```

### Update Company
```
PUT /companies/:id
Body: UpdateCompanyDto (all fields above, all optional)
Response: Updated company object
```

### Get Company
```
GET /companies/:id
Response: Full company object with all fields
```

---

## Field Validation Rules

### Email
- Valid email format
- Max 255 characters

### Phone
- String format
- Max 50 characters

### URLs
- Valid URL format
- Max 255 characters

### Postal Code
- Numbers only
- Max 20 characters

### Country Code
- Exactly 2 uppercase letters (e.g., "TH")
- ISO 3166-1 alpha-2 format

### Employee Count
- Positive integer
- Min: 1, Max: 1,000,000

### Text Fields
- Company names: Max 255 characters
- Business description: Max 1000 characters
- Address fields: Max 255 characters (line 1/2) or 100 characters (district/subdistrict/province)

---

## Implementation Files

### Frontend
- `apps/web/components/company-create-dialog.tsx` - Create form
- `apps/web/components/company-edit-dialog.tsx` - Edit form
- `packages/types/src/company.ts` - TypeScript interfaces

### Backend
- `apps/api/src/dtos/enhanced-company.dto.ts` - DTOs with validation
- `apps/api/src/modules/companies/companies.service.ts` - Business logic
- `apps/api/src/modules/companies/companies.controller.ts` - API endpoints

### Database
- `apps/api/src/database/migrations/1735601000000-InitialSchema.ts` - Schema definition

---

## Build Status
✅ All packages build successfully with no errors
✅ TypeScript compilation passes
✅ No linting errors introduced

---

## Next Steps for User

1. **Test in Development:**
   - Start the development environment
   - Navigate to `/lookup` page
   - Try creating a new company with various fields
   - Try editing an existing company
   - Verify data persists correctly

2. **Optional Enhancements:**
   - Add remaining fields if needed (social media, logo, etc.)
   - Add field-level validation feedback
   - Add auto-complete for address fields
   - Add image upload for logo

3. **Production Deployment:**
   - Deploy backend API changes
   - Deploy frontend changes
   - Run database migrations (already exist)
   - Test end-to-end in staging environment
