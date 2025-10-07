import { useState, useCallback } from 'react'
import { z } from 'zod'

/**
 * Custom hook for form validation using Zod schemas
 * Provides validation, error tracking, and error management utilities
 */
export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Validate data against the schema
   * Returns true if valid, false if invalid
   * Sets errors state with validation messages
   */
  const validate = useCallback(
    (data: unknown): data is z.infer<T> => {
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
    },
    [schema]
  )

  /**
   * Validate a single field
   * Useful for onBlur validation
   */
  const validateField = useCallback(
    (fieldName: string, value: unknown): boolean => {
      try {
        // Try to parse just this field if schema supports it
        const fieldSchema = (schema as any).shape?.[fieldName]
        if (fieldSchema) {
          fieldSchema.parse(value)
          clearError(fieldName)
          return true
        }
        return false
      } catch (error) {
        if (error instanceof z.ZodError && error.errors[0]) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error.errors[0].message,
          }))
        }
        return false
      }
    },
    [schema]
  )

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Get error message for a specific field
   */
  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field]
    },
    [errors]
  )

  /**
   * Check if a specific field has an error
   */
  const hasError = useCallback(
    (field: string): boolean => {
      return !!errors[field]
    },
    [errors]
  )

  return {
    errors,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    getError,
    hasError,
  }
}
