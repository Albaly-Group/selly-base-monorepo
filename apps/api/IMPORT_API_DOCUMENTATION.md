# Import API Documentation

This document describes the CSV/XLSX import functionality for bulk data import into the system.

## Overview

The import feature allows users to:
1. Download template files (CSV or XLSX) for different entity types
2. Upload filled templates for validation
3. Preview and filter imported data before saving
4. Execute the import with error handling

## Supported Entity Types

- `companies` - Company/business records
- `contacts` - Contact person records
- `activities` - Activity/interaction records

## API Endpoints

### 1. Download Import Templates

#### CSV Template
```
GET /imports/templates/{entityType}/csv
```

**Parameters:**
- `entityType`: One of `companies`, `contacts`, or `activities`

**Example:**
```bash
curl -X GET "http://localhost:3001/imports/templates/companies/csv" \
  -o companies_import_template.csv
```

**Response:**
- Content-Type: `text/csv`
- Downloads a CSV file with headers and example row

#### XLSX Template
```
GET /imports/templates/{entityType}/xlsx
```

**Parameters:**
- `entityType`: One of `companies`, `contacts`, or `activities`

**Example:**
```bash
curl -X GET "http://localhost:3001/imports/templates/companies/xlsx" \
  -o companies_import_template.xlsx
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Downloads an Excel file with:
  - Data sheet with headers and example row
  - Instructions sheet with field descriptions

### 2. Upload Import File

```
POST /imports/upload
```

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file`: The CSV or XLSX file to upload (required)
- `entityType`: Entity type (required) - one of `companies`, `contacts`, or `activities`
- `organizationId`: Organization UUID (optional)

**Example:**
```bash
curl -X POST "http://localhost:3001/imports/upload" \
  -F "file=@companies.xlsx" \
  -F "entityType=companies" \
  -F "organizationId=123e4567-e89b-12d3-a456-426614174000"
```

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "filename": "companies.xlsx",
  "status": "uploaded",
  "totalRecords": 100,
  "message": "File uploaded successfully. You can now validate and preview the data."
}
```

### 3. Validate Import Data

```
POST /imports/{id}/validate
```

**Parameters:**
- `id`: Import job ID (from upload response)
- `organizationId`: Organization UUID (optional, query parameter)

**Example:**
```bash
curl -X POST "http://localhost:3001/imports/456e7890-e89b-12d3-a456-426614174001/validate?organizationId=123e4567-e89b-12d3-a456-426614174000"
```

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "status": "validated",
  "totalRecords": 100,
  "validRecords": 98,
  "errorRecords": 2,
  "warningCount": 5,
  "message": "Validation completed",
  "errors": [
    {
      "row": 5,
      "column": "Email",
      "value": "invalid-email",
      "message": "Invalid email format",
      "severity": "error"
    },
    {
      "row": 12,
      "column": "Company Name (English)",
      "message": "Required field \"Company Name (English)\" is missing or empty",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "row": 3,
      "column": "Phone",
      "value": "123456",
      "message": "Phone number format may be incorrect",
      "severity": "warning"
    }
  ]
}
```

### 4. Preview Import Data

```
GET /imports/{id}/preview
```

**Parameters:**
- `id`: Import job ID
- `organizationId`: Organization UUID (optional, query parameter)
- `page`: Page number for pagination (optional, default: 1)
- `limit`: Items per page (optional, default: 50, max: 100)

**Example:**
```bash
curl -X GET "http://localhost:3001/imports/456e7890-e89b-12d3-a456-426614174001/preview?page=1&limit=10"
```

**Response:**
```json
{
  "rows": [
    {
      "rowIndex": 2,
      "data": {
        "Company Name (English)": "ABC Company Ltd.",
        "Email": "contact@abc.com",
        "Phone": "+66-2-123-4567"
      },
      "errors": [],
      "warnings": [],
      "isValid": true
    },
    {
      "rowIndex": 3,
      "data": {
        "Company Name (English)": "XYZ Corp",
        "Email": "info@xyz.com",
        "Phone": "123456"
      },
      "errors": [],
      "warnings": [
        {
          "row": 3,
          "column": "Phone",
          "value": "123456",
          "message": "Phone number format may be incorrect",
          "severity": "warning"
        }
      ],
      "isValid": true
    }
  ],
  "totalRows": 100,
  "validRows": 98,
  "invalidRows": 2,
  "globalErrors": [],
  "columns": ["Company Name (English)", "Email", "Phone", "..."],
  "page": 1,
  "limit": 10
}
```

### 5. Execute Import

```
POST /imports/{id}/execute
```

**Parameters:**
- `id`: Import job ID
- `organizationId`: Organization UUID (optional, query parameter)

**Request Body (optional):**
```json
{
  "rowIndices": [0, 1, 2],  // Optional: specific rows to import (empty = all valid rows)
  "skipErrors": true         // Optional: skip rows with errors (default: true)
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/imports/456e7890-e89b-12d3-a456-426614174001/execute" \
  -H "Content-Type: application/json" \
  -d '{"skipErrors": true}'
```

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "status": "processing",
  "message": "Import job execution started"
}
```

### 6. Get Import Job Status

```
GET /imports/{id}
```

**Parameters:**
- `id`: Import job ID
- `organizationId`: Organization UUID (optional, query parameter)

**Example:**
```bash
curl -X GET "http://localhost:3001/imports/456e7890-e89b-12d3-a456-426614174001"
```

**Response:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "filename": "companies.xlsx",
  "status": "completed",
  "totalRecords": 100,
  "processedRecords": 98,
  "validRecords": 98,
  "errorRecords": 2,
  "uploadedBy": "user-uuid",
  "createdAt": "2025-01-15T10:30:00Z",
  "completedAt": "2025-01-15T10:32:00Z",
  "errors": [...],
  "warnings": [...],
  "metadata": {
    "entityType": "companies"
  }
}
```

### 7. List Import Jobs

```
GET /imports
```

**Parameters:**
- `status`: Filter by status (optional) - one of `queued`, `uploaded`, `validated`, `processing`, `completed`, `completed_with_errors`, `failed`
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 50, max: 100)
- `organizationId`: Organization UUID (optional)

**Example:**
```bash
curl -X GET "http://localhost:3001/imports?status=completed&page=1&limit=20"
```

**Response:**
```json
{
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "filename": "companies.xlsx",
      "status": "completed",
      "totalRecords": 100,
      "processedRecords": 98,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Import Workflow

### Complete Import Process

1. **Download Template**
   ```
   GET /imports/templates/companies/xlsx
   ```

2. **Fill in Data**
   - Open the downloaded template
   - Fill in company data following the example format
   - Save the file

3. **Upload File**
   ```
   POST /imports/upload
   - file: companies_filled.xlsx
   - entityType: companies
   ```
   
4. **Validate Data**
   ```
   POST /imports/{id}/validate
   ```
   - Review validation errors and warnings
   - Fix errors in the file if needed
   - Re-upload if corrections are required

5. **Preview Data (Optional)**
   ```
   GET /imports/{id}/preview
   ```
   - Review the data that will be imported
   - Apply filters to check specific rows

6. **Execute Import**
   ```
   POST /imports/{id}/execute
   ```
   - Choose whether to skip rows with errors
   - Optionally specify specific rows to import

7. **Check Status**
   ```
   GET /imports/{id}
   ```
   - Monitor import progress
   - Review final results

## Field Validations

### Companies

**Required Fields:**
- Company Name (English)

**Optional Fields with Validation:**
- Email: Must be valid email format
- Website: Must be valid URL format
- LinkedIn URL: Must be valid URL format
- Phone: Must contain at least 7 digits
- Employee Count: Must be numeric
- Annual Revenue: Must be numeric

### Contacts

**Required Fields:**
- First Name
- Last Name
- Email

**Optional Fields with Validation:**
- Email: Must be valid email format
- Phone: Must contain at least 7 digits

### Activities

**Required Fields:**
- Company Name
- Activity Type
- Subject
- Date

**Optional Fields with Validation:**
- Date: Must be valid date format (YYYY-MM-DD)

## Error Handling

### Error Severities

- **error**: Critical validation error that prevents import
- **warning**: Non-critical issue that allows import but should be reviewed

### Common Errors

1. **Missing Required Field**
   ```json
   {
     "row": 5,
     "column": "Company Name (English)",
     "message": "Required field \"Company Name (English)\" is missing or empty",
     "severity": "error"
   }
   ```

2. **Invalid Email Format**
   ```json
   {
     "row": 8,
     "column": "Email",
     "value": "invalid-email",
     "message": "Invalid email format",
     "severity": "error"
   }
   ```

3. **Invalid Number**
   ```json
   {
     "row": 10,
     "column": "Employee Count",
     "value": "abc",
     "message": "Employee count must be a number",
     "severity": "error"
   }
   ```

## Import Status Flow

```
uploaded -> validating -> validated -> processing -> completed
                                                  -> completed_with_errors
                                                  -> failed
```

- **uploaded**: File has been uploaded and parsed successfully
- **validating**: Validation is in progress
- **validated**: Validation completed, ready for import
- **processing**: Import is in progress
- **completed**: Import completed successfully
- **completed_with_errors**: Import completed but some rows had errors (only if skipErrors=true)
- **failed**: Import failed due to system error

## Best Practices

1. **Use Templates**: Always start with the downloaded template to ensure correct format
2. **Validate First**: Always validate before executing import
3. **Review Preview**: Use preview to spot-check data before import
4. **Handle Errors**: Review and fix validation errors in the source file
5. **Monitor Progress**: Check import status after execution
6. **Batch Size**: For large imports (>1000 rows), consider splitting into smaller batches
7. **Data Quality**: Clean data before import to minimize errors

## Limitations

- Maximum file size: 10MB (configurable)
- Maximum rows per import: 10,000 (configurable)
- Supported formats: CSV, XLSX, XLS
- File data is cached temporarily and cleared after import completion

## Notes

- Import is processed asynchronously in the background
- For production use, consider implementing a proper queue system (e.g., Bull, BullMQ)
- File data is stored in memory cache - for production, use proper file storage (S3, Azure Blob, etc.)
- All dates should be in ISO format (YYYY-MM-DD)
- Currency codes should follow ISO 4217 (THB, USD, etc.)
- Country codes should follow ISO 3166-1 alpha-2 (TH, US, etc.)
