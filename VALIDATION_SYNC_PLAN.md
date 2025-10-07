# Validation Synchronization Plan

## Objective
Ensure frontend form validation matches backend DTO validation exactly across all CRUD operations.

## Current State Analysis

### Backend DTOs with Validation
1. **enhanced-company.dto.ts**
   - CreateCompanyDto: companyNameEn required (2-255 chars), all other fields optional
   - UpdateCompanyDto: All fields optional
   - Validation: MinLength, MaxLength, IsEmail, IsUrl, Matches patterns

2. **company-contact.dto.ts**
   - CreateCompanyContactDto: companyId required, all other fields optional
   - UpdateCompanyContactDto: All fields optional
   - Validation: IsEmail, IsUUID, IsString

3. **company-activity.dto.ts**
   - CreateCompanyActivityDto: companyId and activityType required, all other optional
   - Validation: IsUUID, IsString, IsObject

4. **company-list.dto.ts** (need to check)
5. **platform-admin.dto.ts** (need to check)

### Frontend Forms Missing Validation
1. **company-create-dialog.tsx**
   - Only validates companyNameEn is not empty
   - No length, format, or pattern validation
   - No email/URL validation

2. **company-edit-dialog.tsx**
   - No validation at all
   - Accepts any input

3. **company-detail-drawer.tsx**
   - Contact form: No validation
   - Activity form: No validation on required activityType

4. **Other forms** (need to check)

## Implementation Plan

### Phase 1: Create Validation Schema Library
Create `/apps/web/lib/validation-schemas.ts` with Zod schemas that exactly mirror backend DTOs:

```typescript
import { z } from 'zod'

// Mirror backend validation messages
const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Please provide a valid email address',
  STRING_REQUIRED: 'This field is required',
  URL_INVALID: 'Please provide a valid URL',
  PHONE_INVALID: 'Please provide a valid phone number',
}

// Company schemas
export const createCompanySchema = z.object({
  companyNameEn: z.string()
    .min(2, 'Company name must be at least 2 characters long')
    .max(255, 'Company name must not exceed 255 characters')
    .trim(),
  companyNameTh: z.string().max(255).trim().optional(),
  primaryRegistrationNo: z.string().max(50).trim().optional(),
  businessDescription: z.string().max(1000).trim().optional(),
  websiteUrl: z.string().url(VALIDATION_MESSAGES.URL_INVALID).max(255).optional().or(z.literal('')),
  primaryEmail: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID).max(255).optional().or(z.literal('')),
  primaryPhone: z.string().max(50).optional(),
  addressLine1: z.string().max(255).trim().optional(),
  addressLine2: z.string().max(255).trim().optional(),
  district: z.string().max(100).trim().optional(),
  subdistrict: z.string().max(100).trim().optional(),
  province: z.string().max(100).trim().optional(),
  postalCode: z.string().max(20).regex(/^[0-9]*$/, 'Postal code must contain only numbers').optional().or(z.literal('')),
  countryCode: z.string().length(2).regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters').optional(),
  companySize: z.enum(['micro', 'small', 'medium', 'large', 'enterprise']).optional(),
  employeeCountEstimate: z.number().min(1).max(1000000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  dataSensitivity: z.enum(['public', 'standard', 'confidential', 'restricted']).optional(),
})

export const updateCompanySchema = createCompanySchema.partial()

// Contact schemas
export const createContactSchema = z.object({
  companyId: z.string().uuid(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  seniorityLevel: z.string().optional(),
  email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID).optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
})

export const updateContactSchema = createContactSchema.partial()

// Activity schemas
export const createActivitySchema = z.object({
  companyId: z.string().uuid(),
  activityType: z.string().min(1, 'Activity type is required'),
  outcome: z.string().optional(),
  content: z.string().optional(),
  contactPerson: z.string().optional(),
  details: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})
```

### Phase 2: Create Validation Hook
Create `/apps/web/hooks/use-form-validation.ts`:

```typescript
import { useState } from 'react'
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: z.infer<T>): boolean => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const clearAllErrors = () => setErrors({})

  return { errors, validate, clearError, clearAllErrors }
}
```

### Phase 3: Update All Forms
1. **company-create-dialog.tsx**
   - Add validation using createCompanySchema
   - Show inline error messages
   - Validate on blur and submit

2. **company-edit-dialog.tsx**
   - Add validation using updateCompanySchema
   - Show inline error messages
   - Validate on blur and submit

3. **company-detail-drawer.tsx**
   - Add validation to contact form using createContactSchema
   - Add validation to activity form using createActivitySchema
   - Show inline error messages
   - Validate required fields before submit

4. **Other forms to check and update**

### Phase 4: Testing
- Test all forms with valid data
- Test all forms with invalid data
- Ensure error messages match backend
- Test edge cases (empty strings, spaces, special characters)

## Implementation Order
1. Create validation-schemas.ts
2. Create use-form-validation.ts hook
3. Update company-create-dialog.tsx
4. Update company-edit-dialog.tsx
5. Update company-detail-drawer.tsx (contacts)
6. Update company-detail-drawer.tsx (activities)
7. Check and update any other forms
8. Test all forms
