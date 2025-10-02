// Platform Admin Data Models and Utilities
// This file ensures data consistency across all platform admin components

import type { Organization, User } from "./types"
import { apiClient } from "./api-client"

// Shared data models for platform admin
export interface TenantData extends Organization {
  user_count: number
  data_count: number
  last_activity: string
}

export interface PlatformUser extends User {
  loginCount: number
  lastLogin: string
}

export interface SharedCompany {
  id: string
  companyNameEn: string
  industrialName: string
  province: string
  registeredNo?: string
  verificationStatus: "Active" | "Needs Verification" | "Invalid"
  dataCompleteness: number
  lastUpdated: string
  createdBy: string
  isShared: boolean
  tenantCount?: number
}

// Updated utility functions that use backend APIs where available
export async function getTotalUsers(): Promise<number> {
  try {
    const response = await apiClient.getOrganizationUsers()
    return response.data?.length || 0
  } catch (error) {
    console.error('Failed to fetch users from backend, using fallback:', error)
    return mockTenantData.reduce((sum, tenant) => sum + tenant.user_count, 0)
  }
}

export async function getTotalDataRecords(): Promise<number> {
  try {
    const response = await apiClient.getDashboardAnalytics()
    return response.totalCompanies || 0
  } catch (error) {
    console.error('Failed to fetch analytics from backend, using fallback:', error)
    return mockTenantData.reduce((sum, tenant) => sum + tenant.data_count, 0)
  }
}

export async function getActiveTenants(): Promise<number> {
  try {
    const response = await apiClient.getDashboardAnalytics()
    return response.activeUsers || 0
  } catch (error) {
    console.error('Failed to fetch analytics from backend, using fallback:', error)
    return mockTenantData.filter(tenant => tenant.status === "active").length
  }
}

export async function getPlatformAnalytics(): Promise<any> {
  try {
    return await apiClient.getDashboardAnalytics()
  } catch (error) {
    console.error('Failed to fetch platform analytics from backend, using fallback:', error)
    return {
      totalCompanies: 1250,
      totalLists: 45,
      totalExports: 128,
      totalImports: 67,
      activeUsers: 23,
      dataQualityScore: 0.89,
      monthlyGrowth: {
        companies: 12.5,
        exports: 8.3,
        users: 5.2
      }
    }
  }
}

// Mock data for consistent usage across platform admin components
export const mockTenantData: TenantData[] = [
  {
    id: "org_customer1",
    name: "Customer Company 1",
    domain: "customer1.com",
    status: "active",
    subscription_tier: "professional",
    user_count: 15,
    data_count: 2847,
    last_activity: "2024-12-08T14:30:00Z",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-12-08T14:30:00Z",
  },
  {
    id: "org_customer2",
    name: "Global Manufacturing Inc",
    domain: "globalmanuf.com",
    status: "active",
    subscription_tier: "enterprise",
    user_count: 45,
    data_count: 8934,
    last_activity: "2024-12-08T13:15:00Z",
    created_at: "2024-02-20T09:30:00Z",
    updated_at: "2024-12-08T13:15:00Z",
  },
  {
    id: "org_customer3",
    name: "Tech Solutions Ltd",
    domain: "techsolutions.co.th",
    status: "inactive",
    subscription_tier: "basic",
    user_count: 3,
    data_count: 456,
    last_activity: "2024-11-20T16:45:00Z",
    created_at: "2024-05-10T14:20:00Z",
    updated_at: "2024-11-20T16:45:00Z",
  }
]

export const mockPlatformUsers: PlatformUser[] = [
  {
    id: "1",
    name: "Platform Admin",
    email: "platform@albaly.com",
    role: "platform_admin",
    status: "active",
    organization_id: null as any, // Platform admins don't belong to an organization
    organization: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-12-08T14:30:00Z",
    lastLogin: "2024-12-08T14:30:00Z",
    loginCount: 245
  },
  {
    id: "2",
    name: "Jane Customer Admin",
    email: "admin@customer1.com",
    role: "customer_admin",
    status: "active",
    organization_id: "org_customer1",
    organization: {
      id: "org_customer1",
      name: "Customer Company 1",
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-12-08T14:30:00Z"
    },
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-12-08T13:15:00Z",
    lastLogin: "2024-12-08T13:15:00Z",
    loginCount: 156
  },
  {
    id: "3",
    name: "John User",
    email: "john@customer1.com",
    role: "user",
    status: "active",
    organization_id: "org_customer1",
    organization: {
      id: "org_customer1",
      name: "Customer Company 1",
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-12-08T14:30:00Z"
    },
    created_at: "2024-03-01T14:20:00Z",
    updated_at: "2024-12-08T11:45:00Z",
    lastLogin: "2024-12-08T11:45:00Z",
    loginCount: 89
  },
  {
    id: "4",
    name: "Sarah Manager",
    email: "sarah@globalmanuf.com",
    role: "customer_admin",
    status: "active",
    organization_id: "org_customer2",
    organization: {
      id: "org_customer2",
      name: "Global Manufacturing Inc",
      domain: "globalmanuf.com",
      status: "active",
      subscription_tier: "enterprise",
      created_at: "2024-02-20T09:30:00Z",
      updated_at: "2024-12-08T13:15:00Z"
    },
    created_at: "2024-01-20T09:15:00Z",
    updated_at: "2024-12-07T16:30:00Z",
    lastLogin: "2024-12-07T16:30:00Z",
    loginCount: 203
  },
  {
    id: "5",
    name: "Mike Staff",
    email: "mike@techsolutions.co.th",
    role: "staff",
    status: "inactive",
    organization_id: "org_customer3",
    organization: {
      id: "org_customer3",
      name: "Tech Solutions Ltd",
      domain: "techsolutions.co.th",
      status: "inactive",
      subscription_tier: "basic",
      created_at: "2024-05-10T14:20:00Z",
      updated_at: "2024-11-20T16:45:00Z"
    },
    created_at: "2024-05-10T11:30:00Z",
    updated_at: "2024-11-15T10:20:00Z",
    lastLogin: "2024-11-15T10:20:00Z",
    loginCount: 42
  }
]

export const mockSharedCompanies: SharedCompany[] = [
  {
    id: "shared_1",
    companyNameEn: "Thai Airways International PCL",
    industrialName: "Transportation",
    province: "Bangkok",
    registeredNo: "0107537000004",
    verificationStatus: "Active",
    dataCompleteness: 98,
    lastUpdated: "2024-12-08T14:30:00Z",
    createdBy: "platform_admin",
    isShared: true,
    tenantCount: 12
  },
  {
    id: "shared_2",
    companyNameEn: "CP Group (Charoen Pokphand)",
    industrialName: "Agriculture/Food",
    province: "Bangkok",
    registeredNo: "0107536000321",
    verificationStatus: "Active",
    dataCompleteness: 95,
    lastUpdated: "2024-12-07T16:20:00Z",
    createdBy: "platform_admin",
    isShared: true,
    tenantCount: 12
  },
  {
    id: "shared_3",
    companyNameEn: "PTT Public Company Limited",
    industrialName: "Energy/Oil & Gas",
    province: "Bangkok",
    registeredNo: "0107536000121",
    verificationStatus: "Active",
    dataCompleteness: 97,
    lastUpdated: "2024-12-06T09:15:00Z",
    createdBy: "platform_admin",
    isShared: true,
    tenantCount: 11
  }
]

// Utility functions for data consistency
export function getTenantUsageLevel(dataCount: number): "high" | "medium" | "low" {
  if (dataCount > 5000) return "high"
  if (dataCount > 1000) return "medium"
  return "low"
}

// Function to ensure organization data consistency across components
export function validateOrganizationData(org: TenantData): boolean {
  return !!(
    org.id &&
    org.name &&
    org.status &&
    org.subscription_tier &&
    typeof org.user_count === "number" &&
    typeof org.data_count === "number" &&
    org.created_at &&
    org.updated_at
  )
}

// Function to ensure user data consistency
export function validateUserData(user: PlatformUser): boolean {
  return !!(
    user.id &&
    user.name &&
    user.email &&
    user.role &&
    user.status &&
    user.created_at &&
    user.updated_at &&
    typeof user.loginCount === "number"
  )
}