# BACKEND API QUICK REFERENCE

> **TL;DR:** All backend APIs are working! Use `apiClient` from `apps/web/lib/api-client.ts` to call any endpoint.

## Quick Start

```typescript
import { apiClient } from '@/lib/api-client'

// Get companies
const companies = await apiClient.getCompanies({ page: 1, limit: 10 })

// Get export jobs
const exports = await apiClient.getExportJobs()

// Get dashboard analytics
const analytics = await apiClient.getDashboardAnalytics()

// Get staff members
const staff = await apiClient.getStaffMembers()
```

## All Available Methods

### Authentication
```typescript
await apiClient.login('email', 'password')
await apiClient.getCurrentUser()
await apiClient.refreshToken()
apiClient.logout()
```

### Companies
```typescript
await apiClient.getCompanies({ page: 1, limit: 10 })
await apiClient.searchCompanies({ searchTerm: 'query' })
await apiClient.getCompanyById('id')
await apiClient.createCompany(data)
await apiClient.updateCompany('id', data)
await apiClient.deleteCompany('id')
await apiClient.bulkCreateCompanies([data])
```

### Company Lists
```typescript
await apiClient.getCompanyLists({ page: 1, limit: 10 })
await apiClient.getCompanyListById('id')
await apiClient.createCompanyList(data)
await apiClient.updateCompanyList('id', data)
await apiClient.deleteCompanyList('id')
await apiClient.getCompanyListItems('id')
await apiClient.addCompaniesToList('listId', ['companyId1', 'companyId2'])
await apiClient.removeCompaniesFromList('listId', ['companyId1'])
```

### Exports
```typescript
await apiClient.getExportJobs({ status: 'completed', page: 1 })
await apiClient.createExportJob({ filename: 'export.csv', format: 'CSV' })
await apiClient.getExportJobById('id')
await apiClient.downloadExportFile('id')
await apiClient.cancelExportJob('id')
```

### Imports
```typescript
await apiClient.getImportJobs({ status: 'processing', page: 1 })
await apiClient.createImportJob({ filename: 'import.csv' })
await apiClient.getImportJobById('id')
await apiClient.validateImportData('id')
await apiClient.executeImportJob('id')
```

### Staff
```typescript
await apiClient.getStaffMembers({ page: 1, limit: 10 })
await apiClient.createStaffMember({ name: 'John', email: 'john@example.com' })
await apiClient.updateStaffMember('id', data)
await apiClient.deleteStaffMember('id')
await apiClient.updateStaffRole('id', 'manager')
```

### Reports
```typescript
await apiClient.getDashboardAnalytics()
await apiClient.getDataQualityMetrics()
await apiClient.getUserActivityReports({ startDate: '2024-01-01', endDate: '2024-12-31' })
await apiClient.getExportHistoryReports({ startDate: '2024-01-01', endDate: '2024-12-31' })
```

### Admin
```typescript
await apiClient.getOrganizationUsers({ page: 1, limit: 10 })
await apiClient.createOrganizationUser({ name: 'User', email: 'user@example.com' })
await apiClient.updateOrganizationUser('id', data)
await apiClient.deleteOrganizationUser('id')
await apiClient.getOrganizationPolicies()
await apiClient.updateOrganizationPolicies(policies)
await apiClient.getIntegrationSettings()
await apiClient.updateIntegrationSettings(settings)
```

## Response Formats

### List Responses
```typescript
{
  data: [{ id: '1', name: 'Item' }],
  pagination: {
    page: 1,
    limit: 50,
    total: 100,
    totalPages: 2,
    hasNext: true,
    hasPrev: false
  }
}
```

### Single Item Responses
```typescript
{
  id: '1',
  name: 'Item',
  // ... other fields
}
```

### Success Messages
```typescript
{
  message: 'Operation completed successfully'
}
```

## Error Handling

```typescript
try {
  const data = await apiClient.getCompanies()
} catch (error) {
  console.error('API Error:', error.message)
  // Error messages are user-friendly
}
```

## Testing

Visit http://localhost:3000/api-test to test all endpoints interactively.

## Common Patterns

### With Loading State
```typescript
const [loading, setLoading] = useState(false)
const [data, setData] = useState([])

const fetchData = async () => {
  setLoading(true)
  try {
    const response = await apiClient.getCompanies()
    setData(response.data)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

### With Error State
```typescript
const [error, setError] = useState('')

try {
  await apiClient.createCompany(data)
  setError('')
} catch (err) {
  setError(err.message)
}
```

### With Pagination
```typescript
const [page, setPage] = useState(1)
const response = await apiClient.getCompanies({ page, limit: 20 })
// Use response.pagination.hasNext to show "Load More"
```

## Environment Setup

### Development
```bash
# Backend runs on port 3001
SKIP_DATABASE=true npm run dev

# Frontend runs on port 3000
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

### Production
```bash
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## Notes

- All endpoints require the backend to be running on port 3001
- Authentication endpoints will set JWT token automatically
- Token is stored in localStorage and included in all requests
- Mock data is returned when database is not connected
- All endpoints follow REST conventions
- Response pagination is consistent across all list endpoints

## Need Help?

1. Check API documentation: http://localhost:3001/docs
2. Test endpoints: http://localhost:3000/api-test
3. Review API client source: `apps/web/lib/api-client.ts`
4. Check backend logs for detailed error messages
