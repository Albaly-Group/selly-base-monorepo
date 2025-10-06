# New API Endpoints Documentation

This document describes the newly implemented API endpoints for reference data, company contacts, company activities, and audit logs.

> **📋 Related Documentation**: For dropdown integration in the frontend, see [DROPDOWN_API_DOCUMENTATION.md](../../DROPDOWN_API_DOCUMENTATION.md)

## Table of Contents
- [Reference Data API](#reference-data-api)
- [Company Contacts API](#company-contacts-api)
- [Company Activities API](#company-activities-api)
- [Audit Logs API](#audit-logs-api)

---

## Reference Data API

Base path: `/api/v1/reference-data`

### GET /reference-data/industries

Get all industries with optional filtering.

**Query Parameters:**
- `active` (boolean, optional): Filter by active status. Default: true

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "TECH",
      "name": "Technology",
      "nameEn": "Technology",
      "nameTh": "เทคโนโลยี",
      "description": "Technology sector",
      "classificationSystem": "ISIC",
      "level": 1
    }
  ]
}
```

**Fallback Data:**
Returns hardcoded industry list if database is not available or empty.

---

### GET /reference-data/provinces

Get all provinces with optional filtering.

**Query Parameters:**
- `active` (boolean, optional): Filter by active status. Default: true
- `countryCode` (string, optional): Filter by country code. Default: TH

**Response:**
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

**Fallback Data:**
Returns hardcoded province list if database is not available or empty.

---

### GET /reference-data/company-sizes

Get all company size categories.

**Response:**
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
      "label": "Large (251-1000 employees)",
      "code": "L",
      "displayName": "Large (L)"
    },
    {
      "value": "enterprise",
      "label": "Enterprise (1000+ employees)",
      "code": "L",
      "displayName": "Large (L)"
    }
  ]
}
```

**Note:** Currently returns static data. Future enhancement will use database.

---

### GET /reference-data/contact-statuses

Get all contact status options.

**Response:**
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

**Note:** Currently returns static data. Future enhancement will use database.

---

## Company Contacts API

Base path: `/api/v1/company-contacts`

### GET /company-contacts

Get company contacts with optional filtering.

**Query Parameters:**
- `companyId` (string, optional): Filter by company UUID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "company-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "title": "Chief Technology Officer",
      "department": "Technology",
      "seniorityLevel": "Executive",
      "email": "john.doe@company.com",
      "phone": "+66-2-123-4567",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "confidenceScore": "0.95",
      "lastVerifiedAt": "2024-01-01T00:00:00.000Z",
      "verificationMethod": "manual",
      "isOptedOut": false,
      "optOutDate": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "company": {
        "id": "company-uuid",
        "nameEn": "Company Name",
        "displayName": "Company Name"
      }
    }
  ]
}
```

---

### GET /company-contacts/:id

Get a specific contact by ID.

**Path Parameters:**
- `id` (string): Contact UUID

**Response:** Same as single contact object in GET /company-contacts

**Error Responses:**
- 404: Contact not found

---

### POST /company-contacts

Create a new company contact. **Requires Authentication**

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "companyId": "company-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "title": "Chief Technology Officer",
  "department": "Technology",
  "seniorityLevel": "Executive",
  "email": "john.doe@company.com",
  "phone": "+66-2-123-4567",
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

**Required Fields:**
- `companyId`

**Response:**
```json
{
  "id": "uuid",
  "companyId": "company-uuid",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "title": "Chief Technology Officer",
  "department": "Technology",
  "email": "john.doe@company.com",
  "phone": "+66-2-123-4567",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- 400: Invalid input
- 401: Unauthorized

---

### PUT /company-contacts/:id

Update a company contact. **Requires Authentication**

**Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Contact UUID

**Request Body:** Same as POST, all fields optional except those being updated

**Response:** Same as POST response

**Error Responses:**
- 404: Contact not found
- 401: Unauthorized

---

### DELETE /company-contacts/:id

Delete a company contact. **Requires Authentication**

**Headers:**
- `Authorization: Bearer <token>`

**Path Parameters:**
- `id` (string): Contact UUID

**Response:**
```json
{
  "message": "Contact deleted successfully"
}
```

**Error Responses:**
- 404: Contact not found
- 401: Unauthorized

---

## Company Activities API

Base path: `/api/v1/company-activities`

### GET /company-activities

Get company activities with optional filtering.

**Query Parameters:**
- `companyId` (string, optional): Filter by company UUID
- `activityType` (string, optional): Filter by activity type (call, meeting, email, note, task, other)
- `limit` (number, optional): Number of records to return. Default: 50

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "organizationId": "org-uuid",
      "activityType": "call",
      "entityType": "company",
      "entityId": "company-uuid",
      "details": {
        "outcome": "Interested",
        "content": "Discussed B2B software requirements",
        "contactPerson": "John Doe"
      },
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Sales Rep",
        "email": "sales@company.com"
      }
    }
  ]
}
```

---

### GET /company-activities/:id

Get a specific activity by ID.

**Path Parameters:**
- `id` (string): Activity UUID

**Response:** Same as single activity object in GET /company-activities

**Error Responses:**
- 404: Activity not found

---

### POST /company-activities

Log a new company activity. **Requires Authentication**

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "companyId": "company-uuid",
  "activityType": "call",
  "outcome": "Interested",
  "content": "Discussed B2B software requirements",
  "contactPerson": "John Doe",
  "details": {
    "duration": 30,
    "followUpRequired": true
  },
  "metadata": {
    "source": "web",
    "deviceType": "desktop"
  }
}
```

**Required Fields:**
- `companyId`
- `activityType`

**Activity Types:**
- `call`: Phone call
- `meeting`: In-person or virtual meeting
- `email`: Email communication
- `note`: General note or observation
- `task`: Task or follow-up action
- `other`: Other type of activity

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "activityType": "call",
  "entityType": "company",
  "entityId": "company-uuid",
  "details": {
    "outcome": "Interested",
    "content": "Discussed B2B software requirements",
    "contactPerson": "John Doe"
  },
  "metadata": {},
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- 400: Invalid input
- 401: Unauthorized

---

## Audit Logs API

Base path: `/api/v1/audit/logs`

### GET /audit/logs

Get audit logs with optional filtering. **Requires Authentication**

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `entityType` (string, optional): Filter by entity type (e.g., Company, CompanyList)
- `entityId` (string, optional): Filter by entity UUID
- `userId` (string, optional): Filter by user UUID
- `actionType` (string, optional): Filter by action type (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, SEARCH, EXPORT, IMPORT)
- `limit` (number, optional): Number of records to return. Default: 50
- `offset` (number, optional): Number of records to skip. Default: 0

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "organizationId": "org-uuid",
      "userId": "user-uuid",
      "entityType": "Company",
      "entityId": "company-uuid",
      "actionType": "UPDATE",
      "resourceType": "company",
      "resourcePath": "/api/companies/company-uuid",
      "oldValues": {
        "phone": "+66-2-123-4566"
      },
      "newValues": {
        "phone": "+66-2-123-4567"
      },
      "changes": {
        "phone": {
          "old": "+66-2-123-4566",
          "new": "+66-2-123-4567"
        }
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "sessionId": "session-uuid",
      "requestId": "request-uuid",
      "statusCode": 200,
      "errorMessage": null,
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "Admin User",
        "email": "admin@company.com"
      }
    }
  ],
  "total": 1
}
```

**Error Responses:**
- 401: Unauthorized

---

## Integration Examples

### Frontend Integration Example (Lead Scoring Panel)

```typescript
import { apiClient } from "@/lib/api-client"

// Fetch industries for dropdown
const fetchIndustries = async () => {
  try {
    const response = await apiClient.getIndustries()
    setIndustrialOptions(response.data.map(item => item.name))
  } catch (error) {
    console.error('Failed to fetch industries:', error)
    // Fallback to hardcoded options
  }
}
```

### Frontend Integration Example (Add Contact)

```typescript
import { apiClient } from "@/lib/api-client"

const handleSaveContact = async () => {
  try {
    await apiClient.createCompanyContact({
      companyId: company.id,
      firstName: "John",
      lastName: "Doe",
      title: "CTO",
      email: "john@company.com",
      phone: "+66-2-123-4567"
    })
    console.log('Contact added successfully')
  } catch (error) {
    console.error('Failed to add contact:', error)
  }
}
```

### Frontend Integration Example (Log Activity)

```typescript
import { apiClient } from "@/lib/api-client"

const handleLogActivity = async () => {
  try {
    await apiClient.createCompanyActivity({
      companyId: company.id,
      activityType: "call",
      outcome: "Interested",
      content: "Discussed B2B requirements"
    })
    console.log('Activity logged successfully')
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
```

---

## Database Schema

### company_contacts Table

Already exists in the database schema. See `apps/api/src/entities/CompanyContacts.ts` for full definition.

### user_activity_logs Table

Already exists in the database schema. Used for company activities. See `apps/api/src/entities/UserActivityLogs.ts` for full definition.

### audit_logs Table

Already exists in the database schema. See `apps/api/src/entities/AuditLogs.ts` for full definition.

### ref_industry_codes Table

Already exists in the database schema. See `apps/api/src/entities/RefIndustryCodes.ts` for full definition.

### ref_regions Table

Already exists in the database schema. See `apps/api/src/entities/RefRegions.ts` for full definition.

---

## Testing Recommendations

1. **Reference Data Endpoints:**
   - Test with empty database (should return fallback data)
   - Test with populated database
   - Test filtering parameters

2. **Company Contacts Endpoints:**
   - Test CRUD operations
   - Test authentication requirements
   - Test validation of required fields
   - Test with invalid company IDs

3. **Company Activities Endpoints:**
   - Test logging different activity types
   - Test filtering by company and activity type
   - Test authentication requirements
   - Test with invalid company IDs

4. **Audit Logs Endpoint:**
   - Test filtering by different parameters
   - Test pagination
   - Test authentication requirements
   - Verify logs are created automatically by other operations

---

## Known Limitations

1. **Lead Scoring Calculations:** Not yet implemented. The frontend applies client-side filtering but true lead scoring algorithms are pending.

2. **Reference Data Seeding:** Industry and province reference data tables may be empty initially. Fallback data is provided, but proper database seeding is recommended.

3. **Company Size & Contact Status:** Currently static data in the service. Future enhancement will use database tables.

4. **Activity History in UI:** The company detail drawer shows the activity tab, but fetching and displaying activities from the API is not yet fully implemented.

5. **Audit Logs in UI:** The company detail drawer shows the history tab for audit logs, but fetching and displaying them is not yet fully implemented.

---

## Future Enhancements

1. Implement proper lead scoring algorithms with configurable weights
2. Add database seeding scripts for reference data
3. Create database tables for company sizes and contact statuses
4. Implement real-time activity feed in company detail view
5. Implement audit log display in company detail history tab
6. Add batch operations for contacts and activities
7. Add file attachment support for activities
8. Implement contact verification workflows
9. Add activity reminders and follow-up scheduling
