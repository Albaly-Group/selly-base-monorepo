// Multi-tenant organization structure
export interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  status: 'active' | 'inactive' | 'suspended'
  subscription_tier?: 'basic' | 'professional' | 'enterprise'
  settings?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// Updated to match actual database schema with tenant support
export interface User {
  id: string
  organization_id: string
  email: string
  name: string
  avatar_url?: string | null
  status: 'active' | 'inactive' | 'suspended'
  last_login_at?: string | null
  email_verified_at?: string | null
  settings?: Record<string, any>
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
  // Related organization data
  organization?: Organization | null
  // Legacy role field for backward compatibility  
  role?: UserRoleName
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

// Legacy type for backward compatibility - Extended for multi-tenant
export type UserRoleName = "user" | "staff" | "admin" | "customer_admin" | "platform_admin"

// Multi-tenant role types
export type TenantRoles = "customer_user" | "customer_staff" | "customer_admin"
export type PlatformRoles = "platform_admin" | "platform_staff"
export type LegacyRoles = "user" | "staff" | "admin"

// Tenant-aware permission context
export interface TenantContext {
  organizationId?: string | null
  isSharedData?: boolean // For Albaly-provided shared data across tenants
}

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
