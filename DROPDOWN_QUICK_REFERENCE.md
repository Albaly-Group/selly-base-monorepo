# Dropdown Quick Reference Guide

**For Developers**: Quick reference for working with dropdowns in the Selly Base Frontend application.

---

## API Endpoints (All Reference Data)

```
Base URL: /api/v1/reference-data
```

| Endpoint | Description | Query Params |
|----------|-------------|--------------|
| `GET /industries` | Get all industries | `active` (boolean) |
| `GET /provinces` | Get all provinces | `active`, `countryCode` |
| `GET /company-sizes` | Get company size categories | None |
| `GET /contact-statuses` | Get contact status options | None |

---

## Quick Copy-Paste Code

### Basic Dropdown with API

```typescript
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Fallback options
const fallbackOptions = ["Option 1", "Option 2", "Option 3"]

export function MyComponent() {
  const [options, setOptions] = useState<string[]>(fallbackOptions)
  const [value, setValue] = useState("")

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.getIndustries() // or getProvinces(), etc.
        if (response.data && response.data.length > 0) {
          setOptions(response.data.map(item => item.name || item.nameEn))
        }
      } catch (error) {
        console.error('Failed to fetch options:', error)
      }
    }
    fetchOptions()
  }, [])

  return (
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
  )
}
```

---

## API Client Methods

```typescript
import { apiClient } from "@/lib/api-client"

// Industries
const industries = await apiClient.getIndustries()
// Returns: { data: [{ id, code, name, nameEn, nameTh, ... }] }

// Provinces
const provinces = await apiClient.getProvinces()
// Returns: { data: [{ id, code, name, nameEn, nameTh, ... }] }

// Company Sizes
const sizes = await apiClient.getCompanySizes()
// Returns: { data: [{ value, label, code, displayName }] }

// Contact Statuses
const statuses = await apiClient.getContactStatuses()
// Returns: { data: [{ value, label, color }] }

// Company Lists
const lists = await apiClient.getCompanyLists()
// Returns: { data: [{ id, name, description, ... }] }
```

---

## Common Patterns

### Fetch on Component Mount

```typescript
useEffect(() => {
  fetchOptions()
}, [])
```

### Fetch on Dialog/Panel Open

```typescript
useEffect(() => {
  if (open) {
    fetchOptions()
  }
}, [open])
```

### With Loading State

```typescript
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  const fetchOptions = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getIndustries()
      if (response.data && response.data.length > 0) {
        setOptions(response.data.map(item => item.name))
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setIsLoading(false)
    }
  }
  fetchOptions()
}, [])
```

---

## Fallback Options

### Industries
```typescript
const fallbackIndustrialOptions = [
  "Manufacturing",
  "Logistics",
  "Automotive",
  "Tourism",
  "Agriculture",
  "Technology",
  "Healthcare",
]
```

### Provinces
```typescript
const fallbackProvinceOptions = [
  "Bangkok",
  "Chiang Mai",
  "Phuket",
  "Khon Kaen",
  "Chonburi",
  "Rayong",
  "Samut Prakan"
]
```

### Company Sizes
```typescript
const fallbackCompanySizeOptions = [
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
]
```

### Contact Statuses
```typescript
const fallbackContactStatusOptions = [
  "Active",
  "Needs Verification",
  "Invalid"
]
```

---

## Response Mapping Examples

### Industries (Database: ref_industry_codes)
```typescript
// API Response
{
  "data": [
    {
      "id": "uuid",
      "code": "MFG",
      "name": "Manufacturing",
      "nameEn": "Manufacturing",
      "nameTh": "การผลิต"
    }
  ]
}

// Map to options
response.data.map(item => item.name || item.nameEn)
// Result: ["Manufacturing", "Logistics", ...]
```

### Company Sizes (Hardcoded)
```typescript
// API Response
{
  "data": [
    {
      "value": "small",
      "label": "Small (11-50 employees)",
      "code": "S",
      "displayName": "Small (S)"
    }
  ]
}

// Map to options
response.data.map(item => ({
  value: item.code || item.value,
  label: item.displayName || item.label,
}))
// Result: [{ value: "S", label: "Small (S)" }, ...]
```

### Contact Statuses (Hardcoded)
```typescript
// API Response
{
  "data": [
    {
      "value": "active",
      "label": "Active",
      "color": "green"
    }
  ]
}

// Map to options (simple)
response.data.map(item => item.label)
// Result: ["Active", "Needs Verification", ...]

// Map to options (with value)
response.data.map(item => ({
  value: item.label,
  label: item.label,
}))
```

---

## Checklist for Adding New Dropdown

- [ ] Import `apiClient` from `@/lib/api-client`
- [ ] Import `useState` and `useEffect` from `react`
- [ ] Define fallback options constant
- [ ] Create state with fallback as default
- [ ] Implement useEffect with API call
- [ ] Add error handling with console.error
- [ ] Map response data to option format
- [ ] Update SelectContent to use dynamic options
- [ ] Test API success scenario
- [ ] Test API failure scenario (verify fallback works)

---

## Common Mistakes to Avoid

❌ **Don't hardcode options directly in JSX**
```typescript
// BAD
<SelectContent>
  <SelectItem value="option1">Option 1</SelectItem>
  <SelectItem value="option2">Option 2</SelectItem>
</SelectContent>
```

✅ **Do use dynamic rendering with fallback**
```typescript
// GOOD
const [options, setOptions] = useState(fallbackOptions)
// ... fetch from API ...
<SelectContent>
  {options.map(option => (
    <SelectItem key={option} value={option}>
      {option}
    </SelectItem>
  ))}
</SelectContent>
```

❌ **Don't forget error handling**
```typescript
// BAD
const response = await apiClient.getIndustries()
setOptions(response.data)
```

✅ **Do handle errors properly**
```typescript
// GOOD
try {
  const response = await apiClient.getIndustries()
  if (response.data && response.data.length > 0) {
    setOptions(response.data.map(item => item.name))
  }
} catch (error) {
  console.error('Failed to fetch:', error)
  // Fallback already set in initial state
}
```

---

## Where Dropdowns Are Used

| Component | Dropdowns | API Status |
|-----------|-----------|------------|
| lead-scoring-panel.tsx | Industry, Province, Company Size, Contact Status | ✅ All integrated |
| smart-filtering-panel.tsx | Industry, Province, Company Size, Contact Status | ✅ All integrated |
| bulk-actions-panel.tsx | Contact Status | ✅ Integrated |
| add-to-list-dialog.tsx | Company Lists | ✅ Integrated |
| company-detail-drawer.tsx | Activity Type, Outcome | ⚠️ Hardcoded (acceptable) |
| company-edit-dialog.tsx | Various company fields | ✅ Integrated |

---

## Need More Details?

📚 **Full Documentation**: See `DROPDOWN_API_DOCUMENTATION.md`  
📋 **Summary**: See `DROPDOWN_INTEGRATION_SUMMARY.md`  
🔗 **API Docs**: See `apps/api/API_DOCUMENTATION_NEW_ENDPOINTS.md`

---

**Last Updated**: December 2024  
**Maintained by**: Development Team
