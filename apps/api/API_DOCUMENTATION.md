# Selly Base Backend API Documentation

## Overview

Complete NestJS backend API implementation with TypeORM entities, multi-tenant architecture, and comprehensive business logic for company and list management.

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently using mock user for development. JWT authentication to be implemented in next phase.

## Endpoints

### Health Check

#### GET /health
Returns API health status.

**Response:**
```json
"Selly Base API is running with full TypeORM entities and Companies API!"
```

---

## Companies API

### GET /companies/search
Advanced search for companies with filtering and pagination.

**Query Parameters:**
- `searchTerm` (string): Text search in company names and descriptions
- `organizationId` (string): Filter by organization ID
- `includeSharedData` (boolean): Include shared data (default: true)
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 50, max: 100)
- `dataSensitivity` (string): Filter by data sensitivity level
- `dataSource` (string): Filter by data source
- `verificationStatus` (string): Filter by verification status
- `companySize` (string): Filter by company size
- `province` (string): Filter by province

**Example:**
```bash
GET /companies/search?searchTerm=tech&province=Bangkok&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "nameEn": "Sample Tech Corp",
      "nameTh": "บริษัท ตัวอย่าง เทค จำกัด",
      "displayName": "Sample Tech Corp",
      "organizationId": null,
      "businessDescription": "Sample technology company",
      "websiteUrl": "https://sample-tech.com",
      "primaryEmail": "contact@sample-tech.com",
      "province": "Bangkok",
      "countryCode": "TH",
      "dataSource": "albaly_list",
      "isSharedData": true,
      "verificationStatus": "verified",
      "companySize": "large",
      "dataQualityScore": 0.89,
      "tags": ["technology", "enterprise"],
      "contacts": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### GET /companies
Legacy endpoint that uses search functionality.

### GET /companies/:id
Get company by ID with access control.

**Path Parameters:**
- `id` (string): Company UUID

**Query Parameters:**
- `organizationId` (string): Organization context for access control

**Response:** Single company object

### POST /companies
Create a new company.

**Request Body:**
```json
{
  "companyNameEn": "New Company",
  "companyNameTh": "บริษัท ใหม่",
  "businessDescription": "Company description",
  "websiteUrl": "https://example.com",
  "primaryEmail": "contact@example.com",
  "primaryPhone": "+66123456789",
  "addressLine1": "123 Main St",
  "province": "Bangkok",
  "countryCode": "TH",
  "tags": ["tag1", "tag2"]
}
```

**Response:** Created company object

### PUT /companies/:id
Update an existing company.

**Path Parameters:**
- `id` (string): Company UUID

**Request Body:** Partial company update object

**Response:** Updated company object

### DELETE /companies/:id
Delete a company (organization-owned only).

**Path Parameters:**
- `id` (string): Company UUID

**Response:**
```json
{
  "message": "Company deleted successfully"
}
```

### POST /companies/bulk
Get multiple companies by IDs.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** Array of company objects

---

## Company Lists API

### GET /company-lists
Get company lists with filtering and pagination.

**Query Parameters:**
- `searchTerm` (string): Search in list names and descriptions
- `organizationId` (string): Organization context
- `visibility` (string): Filter by visibility (private, team, organization, public)
- `scope` (string): Scope filter (mine, organization, public) - default: "mine"
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 50)

**Example:**
```bash
GET /company-lists?scope=organization&visibility=public
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "name": "Technology Companies",
      "description": "List of technology companies in Thailand",
      "organizationId": "123e4567-e89b-12d3-a456-426614174001",
      "ownerUserId": "123e4567-e89b-12d3-a456-426614174000",
      "visibility": "private",
      "isShared": false,
      "totalCompanies": 2,
      "lastActivityAt": "2025-09-29T10:41:01.421Z",
      "isSmartList": false,
      "smartCriteria": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-29T10:41:01.421Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### GET /company-lists/:id
Get company list by ID.

**Path Parameters:**
- `id` (string): List UUID

**Response:** Single company list object

### POST /company-lists
Create a new company list.

**Request Body:**
```json
{
  "name": "New Prospects List",
  "description": "A list of prospect companies",
  "visibility": "private",
  "isSmartList": false,
  "smartCriteria": {}
}
```

**Response:** Created list object

### PUT /company-lists/:id
Update an existing company list.

**Path Parameters:**
- `id` (string): List UUID

**Request Body:** Partial list update object

**Response:** Updated list object

### DELETE /company-lists/:id
Delete a company list (owner only).

**Path Parameters:**
- `id` (string): List UUID

**Response:**
```json
{
  "message": "Company list deleted successfully"
}
```

### GET /company-lists/:id/items
Get items in a company list with company details.

**Path Parameters:**
- `id` (string): List UUID

**Response:**
```json
[
  {
    "id": "item-123e4567-e89b-12d3-a456-426614174003-1",
    "listId": "123e4567-e89b-12d3-a456-426614174003",
    "companyId": "123e4567-e89b-12d3-a456-426614174002",
    "note": "Promising tech company",
    "position": 1,
    "leadScore": 85.5,
    "scoreBreakdown": {
      "size": 25,
      "industry": 30,
      "location": 15,
      "engagement": 15.5
    },
    "status": "qualified",
    "addedAt": "2024-01-01T00:00:00.000Z",
    "company": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "nameEn": "Sample Tech Corp",
      "displayName": "Sample Tech Corp",
      "businessDescription": "Sample technology company"
    }
  }
]
```

### POST /company-lists/:id/companies
Add companies to a list.

**Path Parameters:**
- `id` (string): List UUID

**Request Body:**
```json
{
  "companyIds": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "message": "Companies added to list successfully",
  "items": [...]
}
```

### DELETE /company-lists/:id/companies
Remove companies from a list.

**Path Parameters:**
- `id` (string): List UUID

**Request Body:**
```json
{
  "companyIds": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "message": "Companies removed from list successfully"
}
```

---

## Data Models

### Company
Complete company entity with multi-tenant support, data quality scoring, and audit trails.

### CompanyList
List entity with ownership, visibility controls, and smart list capabilities.

### CompanyListItem
Join entity with lead scoring, custom fields, and status tracking.

### User & Organization
Multi-tenant architecture with role-based access control.

---

## Features

### Multi-Tenancy
- Organization-scoped data with shared data support
- Proper access control and data isolation
- Role-based permissions (mock implementation)

### Search & Filtering
- Full-text search across company names and descriptions
- Advanced filtering by multiple criteria
- Proper pagination with metadata

### Data Quality
- Quality scoring for companies
- Verification status tracking
- Data source attribution

### Audit Trails
- Created/updated timestamps
- User attribution for all changes
- Activity tracking

### Performance
- Optimized queries with proper indexing strategy
- Cursor-based pagination
- Efficient filtering and search

## Development Mode

The API currently runs in development mode with mock data when `SKIP_DATABASE=true` is set. This allows for:
- Testing all endpoints without database setup
- Demonstration of complete functionality
- Easy integration testing

## Next Steps

1. **JWT Authentication**: Replace mock user with real JWT token validation
2. **Database Connection**: Connect to PostgreSQL database for persistence  
3. **Caching**: Add Redis caching for performance
4. **Rate Limiting**: Implement API rate limiting
5. **Validation**: Add comprehensive request validation with class-validator
6. **Error Handling**: Enhance error responses with proper error codes
7. **Testing**: Add comprehensive test suite
8. **Documentation**: Generate OpenAPI/Swagger documentation