// Updated to match actual database schema
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  status: 'active' | 'inactive' | 'suspended'
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  // Roles are loaded separately via user_roles table
  roles?: Role[]
}

export interface Role {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface Permission {
  id: string
  key: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  assigned_at: string
}

// Legacy type for backward compatibility
export type UserRoleName = "user" | "staff" | "admin"

export interface FilterOptions {
  industrial?: string
  province?: string
  companySize?: "S" | "M" | "L"
  contactStatus?: "Active" | "Needs Verification" | "Invalid"
}

export interface SearchFilters extends FilterOptions {
  searchTerm?: string
}

export interface ExportData {
  companies: any[] // Placeholder for Company type until it's declared or imported
  exportedAt: string
  exportedBy: string
}

// Re-export types from mock-data for convenience
import type { Company, ContactPerson, UserList, LeadScore } from "./mock-data"
export type { Company, ContactPerson, UserList, LeadScore }

// Re-export new company lists types
export * from "./types/company-lists"
