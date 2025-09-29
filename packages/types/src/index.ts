// Organization and User Management Types
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
  organization?: Organization | null
  role?: UserRoleName
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

// Role types
export type UserRoleName = "user" | "staff" | "admin" | "customer_admin" | "platform_admin"
export type TenantRoles = "customer_user" | "customer_staff" | "customer_admin"
export type PlatformRoles = "platform_admin" | "platform_staff"
export type LegacyRoles = "user" | "staff" | "admin"

// Context types
export interface TenantContext {
  organizationId?: string | null
  isSharedData?: boolean
}

// Database types
export interface DatabaseConfig {
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
  ssl?: boolean | object
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

export interface QueryContext {
  organizationId?: string | null
  userId?: string
  includeSharedData?: boolean
}

export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
  command: string
}

// Re-export company types
export * from './company';