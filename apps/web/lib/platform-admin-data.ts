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

let analyticsCache: { data: any; timestamp: number } | null = null
let usersCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 30000

export async function getTotalUsers(): Promise<number> {
  try {
    if (usersCache && Date.now() - usersCache.timestamp < CACHE_DURATION) {
      return usersCache.data?.length || 0
    }
    
    const response = await apiClient.getOrganizationUsers()
    usersCache = { data: response.data, timestamp: Date.now() }
    return response.data?.length || 0
  } catch (error) {
    console.error('Failed to fetch users from backend:', error)
    throw new Error('Unable to fetch users. Please ensure the backend is running.')
  }
}

export async function getTotalDataRecords(): Promise<number> {
  try {
    if (analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_DURATION) {
      return analyticsCache.data.totalCompanies || 0
    }
    
    const response = await apiClient.getDashboardAnalytics()
    analyticsCache = { data: response, timestamp: Date.now() }
    return response.totalCompanies || 0
  } catch (error) {
    console.error('Failed to fetch analytics from backend:', error)
    throw new Error('Unable to fetch analytics. Please ensure the backend is running.')
  }
}

export async function getActiveTenants(): Promise<number> {
  try {
    if (analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_DURATION) {
      return analyticsCache.data.activeUsers || 0
    }
    
    const response = await apiClient.getDashboardAnalytics()
    analyticsCache = { data: response, timestamp: Date.now() }
    return response.activeUsers || 0
  } catch (error) {
    console.error('Failed to fetch analytics from backend:', error)
    throw new Error('Unable to fetch analytics. Please ensure the backend is running.')
  }
}

export async function getPlatformAnalytics(): Promise<any> {
  try {
    if (analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_DURATION) {
      return analyticsCache.data
    }
    
    const response = await apiClient.getDashboardAnalytics()
    analyticsCache = { data: response, timestamp: Date.now() }
    return response
  } catch (error) {
    console.error('Failed to fetch platform analytics from backend:', error)
    throw new Error('Unable to fetch analytics. Please ensure the backend is running.')
  }
}

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

// Mock data for platform admin components
// This data is used for demonstration and development purposes
export const mockTenantData: TenantData[] = [
  {
    id: "org-1",
    name: "Acme Corporation",
    domain: "acme.com",
    status: "active",
    subscription_tier: "enterprise",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-12-08T14:30:00Z",
    user_count: 45,
    data_count: 12500,
    last_activity: "2024-12-08T14:30:00Z"
  },
  {
    id: "org-2",
    name: "TechStart Inc",
    domain: "techstart.io",
    status: "active",
    subscription_tier: "professional",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-12-07T10:15:00Z",
    user_count: 12,
    data_count: 3200,
    last_activity: "2024-12-07T10:15:00Z"
  },
  {
    id: "org-3",
    name: "Global Trade Co",
    domain: "globaltrade.com",
    status: "active",
    subscription_tier: "enterprise",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-12-08T09:00:00Z",
    user_count: 78,
    data_count: 28900,
    last_activity: "2024-12-08T09:00:00Z"
  },
  {
    id: "org-4",
    name: "SmallBiz Solutions",
    domain: "smallbiz.co",
    status: "active",
    subscription_tier: "basic",
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-12-05T16:20:00Z",
    user_count: 5,
    data_count: 450,
    last_activity: "2024-12-05T16:20:00Z"
  },
  {
    id: "org-5",
    name: "Enterprise Systems",
    domain: "entsys.com",
    status: "inactive",
    subscription_tier: "professional",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-11-30T08:00:00Z",
    user_count: 23,
    data_count: 5600,
    last_activity: "2024-11-30T08:00:00Z"
  }
]

export const mockPlatformUsers: PlatformUser[] = [
  {
    id: "1",
    name: "Platform Admin",
    email: "platform@albaly.com",
    role: "platform_admin",
    status: "active",
    organization_id: null as any,
    organization: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-12-08T14:30:00Z",
    lastLogin: "2024-12-08T14:30:00Z",
    loginCount: 245
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@acme.com",
    role: "org_admin",
    status: "active",
    organization_id: "org-1",
    organization: { id: "org-1", name: "Acme Corporation" } as any,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-12-08T12:00:00Z",
    lastLogin: "2024-12-08T12:00:00Z",
    loginCount: 189
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@techstart.io",
    role: "org_admin",
    status: "active",
    organization_id: "org-2",
    organization: { id: "org-2", name: "TechStart Inc" } as any,
    created_at: "2024-02-20T00:00:00Z",
    updated_at: "2024-12-07T15:30:00Z",
    lastLogin: "2024-12-07T15:30:00Z",
    loginCount: 156
  },
  {
    id: "4",
    name: "Bob Wilson",
    email: "bob@globaltrade.com",
    role: "org_admin",
    status: "active",
    organization_id: "org-3",
    organization: { id: "org-3", name: "Global Trade Co" } as any,
    created_at: "2024-01-25T00:00:00Z",
    updated_at: "2024-12-08T10:00:00Z",
    lastLogin: "2024-12-08T10:00:00Z",
    loginCount: 234
  },
  {
    id: "5",
    name: "Alice Brown",
    email: "alice@smallbiz.co",
    role: "staff",
    status: "active",
    organization_id: "org-4",
    organization: { id: "org-4", name: "SmallBiz Solutions" } as any,
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-12-06T09:15:00Z",
    lastLogin: "2024-12-06T09:15:00Z",
    loginCount: 87
  }
]

export const mockSharedCompanies: SharedCompany[] = [
  {
    id: "comp-1",
    companyNameEn: "Bangkok Manufacturing Ltd",
    industrialName: "Manufacturing",
    province: "Bangkok",
    registeredNo: "0105558123456",
    verificationStatus: "Active",
    dataCompleteness: 95,
    lastUpdated: "2024-12-08T10:00:00Z",
    createdBy: "System",
    isShared: true,
    tenantCount: 5
  },
  {
    id: "comp-2",
    companyNameEn: "Thai Export Services Co",
    industrialName: "Import/Export",
    province: "Samut Prakan",
    registeredNo: "0105558234567",
    verificationStatus: "Active",
    dataCompleteness: 88,
    lastUpdated: "2024-12-07T15:30:00Z",
    createdBy: "Platform Admin",
    isShared: true,
    tenantCount: 3
  },
  {
    id: "comp-3",
    companyNameEn: "Logistics Solutions Thailand",
    industrialName: "Logistics",
    province: "Chonburi",
    registeredNo: "0105558345678",
    verificationStatus: "Needs Verification",
    dataCompleteness: 72,
    lastUpdated: "2024-12-05T09:00:00Z",
    createdBy: "Data Import",
    isShared: true,
    tenantCount: 2
  },
  {
    id: "comp-4",
    companyNameEn: "Tech Innovation Hub",
    industrialName: "Technology",
    province: "Bangkok",
    registeredNo: "0105558456789",
    verificationStatus: "Active",
    dataCompleteness: 100,
    lastUpdated: "2024-12-08T14:00:00Z",
    createdBy: "Platform Admin",
    isShared: true,
    tenantCount: 7
  },
  {
    id: "comp-5",
    companyNameEn: "Regional Wholesale Group",
    industrialName: "Wholesale/Retail",
    province: "Nakhon Ratchasima",
    verificationStatus: "Invalid",
    dataCompleteness: 45,
    lastUpdated: "2024-11-30T08:00:00Z",
    createdBy: "Data Import",
    isShared: false,
    tenantCount: 0
  }
]