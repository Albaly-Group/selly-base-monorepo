import { z } from 'zod'

/**
 * Validation schemas that mirror backend DTOs
 * These schemas ensure frontend validation matches backend validation exactly
 */

// Validation messages that match backend
const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Please provide a valid email',
  STRING_REQUIRED: 'This field is required',
  UUID_INVALID: 'Please provide a valid UUID',
  URL_INVALID: 'Please provide a valid URL',
  PHONE_INVALID: 'Please provide a valid phone number',
}

// Company validation schemas (mirror enhanced-company.dto.ts)
export const createCompanySchema = z.object({
  companyNameEn: z
    .string({ required_error: VALIDATION_MESSAGES.STRING_REQUIRED })
    .min(2, 'Company name must be at least 2 characters long')
    .max(255, 'Company name must not exceed 255 characters')
    .transform((val) => val.trim()),
  companyNameTh: z
    .string()
    .max(255, 'Thai company name must not exceed 255 characters')
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  primaryRegistrationNo: z
    .string()
    .max(50)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  businessDescription: z
    .string()
    .max(1000, 'Business description must not exceed 1000 characters')
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .max(255)
    .url(VALIDATION_MESSAGES.URL_INVALID)
    .optional()
    .or(z.literal('')),
  primaryEmail: z
    .string()
    .max(255)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .optional()
    .or(z.literal('')),
  primaryPhone: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z
    .string()
    .max(255)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  addressLine2: z
    .string()
    .max(255)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  postalCode: z
    .string()
    .max(20)
    .regex(/^[0-9]*$/, 'Postal code must contain only numbers')
    .optional()
    .or(z.literal('')),
  primaryIndustryId: z
    .string()
    .uuid(VALIDATION_MESSAGES.UUID_INVALID)
    .optional()
    .or(z.literal('')),
  primaryRegionId: z
    .string()
    .uuid(VALIDATION_MESSAGES.UUID_INVALID)
    .optional()
    .or(z.literal('')),
  companySize: z
    .enum(['micro', 'small', 'medium', 'large', 'enterprise'], {
      errorMap: () => ({ message: 'Invalid company size' }),
    })
    .optional(),
  employeeCountEstimate: z
    .number({ invalid_type_error: 'Employee count must be a number' })
    .int()
    .min(1, 'Employee count must be at least 1')
    .max(1000000, 'Employee count must not exceed 1,000,000')
    .optional(),
  tags: z
    .array(z.string(), { invalid_type_error: 'Each tag must be a string' })
    .max(20, 'Maximum 20 tags are allowed')
    .optional(),
  dataSensitivity: z
    .enum(['public', 'standard', 'confidential', 'restricted'], {
      errorMap: () => ({ message: 'Invalid data sensitivity level' }),
    })
    .optional(),
})

export const updateCompanySchema = z.object({
  companyNameEn: z
    .string()
    .min(2, 'Company name must be at least 2 characters long')
    .max(255, 'Company name must not exceed 255 characters')
    .transform((val) => val.trim())
    .optional(),
  companyNameTh: z
    .string()
    .max(255, 'Thai company name must not exceed 255 characters')
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  primaryRegistrationNo: z
    .string()
    .max(50)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  businessDescription: z
    .string()
    .max(1000, 'Business description must not exceed 1000 characters')
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .max(255)
    .url(VALIDATION_MESSAGES.URL_INVALID)
    .optional()
    .or(z.literal('')),
  primaryEmail: z
    .string()
    .max(255)
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .optional()
    .or(z.literal('')),
  primaryPhone: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z
    .string()
    .max(255)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  addressLine2: z
    .string()
    .max(255)
    .transform((val) => val.trim())
    .optional()
    .or(z.literal('')),
  postalCode: z
    .string()
    .max(20)
    .regex(/^[0-9]*$/, 'Postal code must contain only numbers')
    .optional()
    .or(z.literal('')),
  primaryIndustryId: z
    .string()
    .uuid(VALIDATION_MESSAGES.UUID_INVALID)
    .optional()
    .or(z.literal('')),
  primaryRegionId: z
    .string()
    .uuid(VALIDATION_MESSAGES.UUID_INVALID)
    .optional()
    .or(z.literal('')),
  companySize: z
    .enum(['micro', 'small', 'medium', 'large', 'enterprise'], {
      errorMap: () => ({ message: 'Invalid company size' }),
    })
    .optional(),
  employeeCountEstimate: z
    .number({ invalid_type_error: 'Employee count must be a number' })
    .int()
    .min(1, 'Employee count must be at least 1')
    .max(1000000, 'Employee count must not exceed 1,000,000')
    .optional(),
  tags: z
    .array(z.string(), { invalid_type_error: 'Each tag must be a string' })
    .max(20, 'Maximum 20 tags are allowed')
    .optional(),
  dataSensitivity: z
    .enum(['public', 'standard', 'confidential', 'restricted'], {
      errorMap: () => ({ message: 'Invalid data sensitivity level' }),
    })
    .optional(),
})

// Contact validation schemas (mirror company-contact.dto.ts)
export const createContactSchema = z.object({
  companyId: z.string().uuid(VALIDATION_MESSAGES.UUID_INVALID),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  fullName: z.string().optional().or(z.literal('')),
  title: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  seniorityLevel: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email(VALIDATION_MESSAGES.EMAIL_INVALID)
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  linkedinUrl: z.string().optional().or(z.literal('')),
})

export const updateContactSchema = createContactSchema.partial()

// Activity validation schemas (mirror company-activity.dto.ts)
export const createActivitySchema = z.object({
  companyId: z.string().uuid(VALIDATION_MESSAGES.UUID_INVALID),
  activityType: z
    .string({ required_error: 'Activity type is required' })
    .min(1, 'Activity type is required'),
  outcome: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  contactPerson: z.string().optional().or(z.literal('')),
  details: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Type exports for TypeScript
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type CreateActivityInput = z.infer<typeof createActivitySchema>
