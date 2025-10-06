# Dropdown API Documentation

This document provides a comprehensive overview of all dropdowns in the application and their corresponding API endpoints.

**Last Updated**: December 2024  
**Status**: Complete Audit ✅

---

## Overview

All dropdowns in this application should fetch data from the backend API to ensure consistency and allow for dynamic updates without code changes. This document tracks:
- Location of each dropdown
- API endpoint used (or needed)
- Current implementation status
- Integration instructions

---

## Reference Data API Endpoints

### 1. Industries Dropdown

**API Endpoint**: `GET /api/v1/reference-data/industries`

**Database Table**: `ref_industry_codes`

**Query Parameters**:
- `active` (optional): Filter by active status (default: `true`)

**Response Format**:
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "MFG",
      "name": "Manufacturing",
      "nameEn": "Manufacturing",
      "nameTh": "การผลิต",
      "description": "Manufacturing industry",
      "classificationSystem": "TSIC",
      "level": 1
    }
  ]
}
```

**Frontend Integration**:
```typescript
import { apiClient } from "@/lib/api-client"

const fetchIndustries = async () => {
  try {
    const response = await apiClient.getIndustries()
    setIndustrialOptions(response.data.map(item => item.name || item.nameEn))
  } catch (error) {
    console.error('Failed to fetch industries:', error)
    // Use fallback options
  }
}
```

**Used In**:
- ✅ `lead-scoring-panel.tsx` - Properly integrated with fallback
- ⚠️ `smart-filtering-panel.tsx` - Commented out, needs integration
- ✅ `company-edit-dialog.tsx` - Used for company industry field

---

### 2. Provinces Dropdown

**API Endpoint**: `GET /api/v1/reference-data/provinces`

**Database Table**: `ref_regions`

**Query Parameters**:
- `active` (optional): Filter by active status (default: `true`)
- `countryCode` (optional): Filter by country code (default: `TH`)

**Response Format**:
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "BKK",
      "name": "Bangkok",
      "nameEn": "Bangkok",
      "nameTh": "กรุงเทพมหานคร",
      "regionType": "province",
      "countryCode": "TH"
    }
  ]
}
```

**Frontend Integration**:
```typescript
import { apiClient } from "@/lib/api-client"

const fetchProvinces = async () => {
  try {
    const response = await apiClient.getProvinces()
    setProvinceOptions(response.data.map(item => item.name || item.nameEn))
  } catch (error) {
    console.error('Failed to fetch provinces:', error)
    // Use fallback options
  }
}
```

**Used In**:
- ✅ `lead-scoring-panel.tsx` - Properly integrated with fallback
- ⚠️ `smart-filtering-panel.tsx` - Commented out, needs integration
- ✅ `company-edit-dialog.tsx` - Used for company location field

---

### 3. Company Sizes Dropdown

**API Endpoint**: `GET /api/v1/reference-data/company-sizes`

**Database Table**: N/A (Hardcoded standard values)

**Query Parameters**: None

**Response Format**:
```json
{
  "data": [
    {
      "value": "micro",
      "label": "Micro (1-10 employees)",
      "code": "S",
      "displayName": "Small (S)"
    },
    {
      "value": "small",
      "label": "Small (11-50 employees)",
      "code": "S",
      "displayName": "Small (S)"
    },
    {
      "value": "medium",
      "label": "Medium (51-250 employees)",
      "code": "M",
      "displayName": "Medium (M)"
    },
    {
      "value": "large",
      "label": "Large (251+ employees)",
      "code": "L",
      "displayName": "Large (L)"
    }
  ]
}
```

**Note**: Company sizes are standard categories and do not require a database table. Values are hardcoded in the backend service.

**Frontend Integration**:
```typescript
import { apiClient } from "@/lib/api-client"

const fetchCompanySizes = async () => {
  try {
    const response = await apiClient.getCompanySizes()
    setCompanySizeOptions(
      response.data.map(item => ({
        value: item.code || item.value,
        label: item.displayName || item.label,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch company sizes:', error)
    // Use fallback options
  }
}
```

**Used In**:
- ✅ `lead-scoring-panel.tsx` - Properly integrated with fallback
- ⚠️ `smart-filtering-panel.tsx` - Commented out, needs integration
- ✅ `company-edit-dialog.tsx` - Used for company size field

---

### 4. Contact Statuses Dropdown

**API Endpoint**: `GET /api/v1/reference-data/contact-statuses`

**Database Table**: N/A (Hardcoded standard values)

**Query Parameters**: None

**Response Format**:
```json
{
  "data": [
    {
      "value": "active",
      "label": "Active",
      "color": "green"
    },
    {
      "value": "needs_verification",
      "label": "Needs Verification",
      "color": "yellow"
    },
    {
      "value": "invalid",
      "label": "Invalid",
      "color": "red"
    },
    {
      "value": "opted_out",
      "label": "Opted Out",
      "color": "gray"
    }
  ]
}
```

**Note**: Contact statuses are standard categories. Values are hardcoded in the backend service unless custom statuses are needed.

**Frontend Integration**:
```typescript
import { apiClient } from "@/lib/api-client"

const fetchContactStatuses = async () => {
  try {
    const response = await apiClient.getContactStatuses()
    setContactStatusOptions(response.data.map(item => item.label))
  } catch (error) {
    console.error('Failed to fetch contact statuses:', error)
    // Use fallback options
  }
}
```

**Used In**:
- ✅ `lead-scoring-panel.tsx` - Properly integrated with fallback
- ❌ `bulk-actions-panel.tsx` - **NEEDS FIXING**: Hardcoded values
- ⚠️ `smart-filtering-panel.tsx` - Commented out, needs integration

---

## Activity-Related Dropdowns

### 5. Activity Types Dropdown

**API Endpoint**: ⚠️ **NOT IMPLEMENTED**

**Current Status**: Hardcoded in components

**Recommended Endpoint**: `GET /api/v1/reference-data/activity-types`

**Current Hardcoded Values**:
```typescript
const activityTypes = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
  { value: "email", label: "Email" }
]
```

**Used In**:
- ❌ `company-detail-drawer.tsx` - Hardcoded

**Recommendation**: 
- Create API endpoint if custom activity types are needed
- For standard types, hardcoded values are acceptable but should be centralized in a constants file

---

### 6. Activity Outcomes Dropdown

**API Endpoint**: ⚠️ **NOT IMPLEMENTED**

**Current Status**: Hardcoded in components

**Recommended Endpoint**: `GET /api/v1/reference-data/activity-outcomes`

**Current Hardcoded Values**:
```typescript
const activityOutcomes = [
  { value: "interested", label: "Interested" },
  { value: "not-interested", label: "Not Interested" },
  { value: "follow-up", label: "Follow-up Required" },
  { value: "qualified", label: "Qualified Lead" }
]
```

**Used In**:
- ❌ `company-detail-drawer.tsx` - Hardcoded

**Recommendation**: 
- Create API endpoint if custom outcomes are needed
- For standard outcomes, hardcoded values are acceptable but should be centralized

---

## List Management Dropdowns

### 7. Company Lists Dropdown

**API Endpoint**: `GET /api/v1/company-lists`

**Database Table**: `company_lists`

**Query Parameters**:
- `searchTerm` (optional): Search lists by name/description
- `organizationId` (optional): Filter by organization
- `scope` (optional): `mine`, `organization`, `public`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response Format**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "High Priority Leads",
      "description": "Companies to contact this week",
      "visibility": "private",
      "status": "active",
      "ownerUser": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Frontend Integration**:
```typescript
import { apiClient } from "@/lib/api-client"

const fetchLists = async () => {
  try {
    const response = await apiClient.getCompanyLists()
    setLists(response.data)
  } catch (error) {
    console.error('Failed to fetch lists:', error)
  }
}
```

**Used In**:
- ✅ `add-to-list-dialog.tsx` - Properly integrated

---

## Import Wizard Dropdowns

### 8. Field Mapping Dropdowns

**Location**: `import-wizard.tsx`

**Purpose**: Map CSV/Excel columns to system fields

**Current Status**: Uses hardcoded system field definitions

**System Fields**:
```typescript
const requiredFields = {
  "company_name_en": "Company Name (English)",
  "registration_id": "Registration ID (13 digits)",
  "industry_name": "Industry/Sector",
  "province": "Province",
  "contact_name": "Contact Person Name",
  "phone": "Phone Number",
  "email": "Email Address",
  "website": "Website URL"
}
```

**Note**: These are internal field mappings and don't need an API endpoint. The detected columns come from parsing the uploaded file.

---

## Summary Table

| Dropdown | Component | API Endpoint | Status | Action Required |
|----------|-----------|--------------|--------|-----------------|
| Industries | lead-scoring-panel.tsx | ✅ GET /reference-data/industries | ✅ Complete | None |
| Industries | smart-filtering-panel.tsx | ⚠️ Commented out | ⚠️ Needs Integration | Implement API call |
| Provinces | lead-scoring-panel.tsx | ✅ GET /reference-data/provinces | ✅ Complete | None |
| Provinces | smart-filtering-panel.tsx | ⚠️ Commented out | ⚠️ Needs Integration | Implement API call |
| Company Sizes | lead-scoring-panel.tsx | ✅ GET /reference-data/company-sizes | ✅ Complete | None |
| Company Sizes | smart-filtering-panel.tsx | ⚠️ Commented out | ⚠️ Needs Integration | Implement API call |
| Contact Status | lead-scoring-panel.tsx | ✅ GET /reference-data/contact-statuses | ✅ Complete | None |
| Contact Status | bulk-actions-panel.tsx | ❌ Hardcoded | ❌ Needs Fixing | **Replace with API call** |
| Contact Status | smart-filtering-panel.tsx | ⚠️ Commented out | ⚠️ Needs Integration | Implement API call |
| Activity Type | company-detail-drawer.tsx | ❌ Hardcoded | ⚠️ Optional | Create API or centralize constants |
| Activity Outcome | company-detail-drawer.tsx | ❌ Hardcoded | ⚠️ Optional | Create API or centralize constants |
| Company Lists | add-to-list-dialog.tsx | ✅ GET /company-lists | ✅ Complete | None |

---

## Required Actions

### High Priority

1. **Fix bulk-actions-panel.tsx** ❌
   - Replace hardcoded contact status values with API call
   - Use `apiClient.getContactStatuses()` with fallback

2. **Fix smart-filtering-panel.tsx** ⚠️
   - Uncomment and implement API calls for all dropdowns
   - Add proper error handling and fallbacks

### Medium Priority

3. **Create Activity Reference Data API** (Optional)
   - If custom activity types/outcomes are needed
   - Otherwise, centralize hardcoded values in a constants file

### Low Priority

4. **Centralize Fallback Options**
   - Move fallback values to a shared constants file
   - Ensure consistency across all components

---

## Integration Best Practices

### Pattern for Dropdown Integration

```typescript
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

// 1. Define fallback options
const fallbackOptions = ["Option 1", "Option 2", "Option 3"]

// 2. Create state
const [options, setOptions] = useState<string[]>(fallbackOptions)

// 3. Fetch from API in useEffect
useEffect(() => {
  const fetchOptions = async () => {
    try {
      const response = await apiClient.getReferenceData()
      if (response.data && response.data.length > 0) {
        setOptions(response.data.map(item => item.name))
      }
    } catch (error) {
      console.error('Failed to fetch options:', error)
      // Fallback options already set in state
    }
  }

  fetchOptions()
}, [])

// 4. Use in Select component
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    {options.map((option) => (
      <SelectItem key={option} value={option}>
        {option}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Error Handling

Always provide:
1. **Fallback data** - Set in initial state
2. **Error logging** - Console.error for debugging
3. **User feedback** - Optional toast notifications

### Performance

- Cache reference data when appropriate
- Use `useMemo` for expensive transformations
- Consider implementing a reference data context for shared data

---

## Testing Checklist

When adding or updating dropdown API integration:

- [ ] API endpoint returns expected data structure
- [ ] Fallback data is displayed if API fails
- [ ] Loading states are handled appropriately
- [ ] Error messages are logged for debugging
- [ ] Dropdown populates correctly on component mount
- [ ] Data updates when dependencies change
- [ ] Empty states are handled gracefully

---

## Related Documentation

- **API Documentation**: `apps/api/API_DOCUMENTATION_NEW_ENDPOINTS.md`
- **API Gaps Analysis**: `API_GAPS_ANALYSIS.md`
- **Backend API Summary**: `BACKEND_API_FINAL_SUMMARY.md`
- **Reference Data Service**: `apps/api/src/modules/reference-data/`

---

**Maintained by**: Development Team  
**Review Frequency**: After each new dropdown addition  
**Last Reviewed**: December 2024
