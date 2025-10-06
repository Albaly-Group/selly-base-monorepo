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

// Backend API functions for platform admin

let tenantsCache: { data: TenantData[]; timestamp: number } | null = null
let platformUsersCache: { data: PlatformUser[]; timestamp: number } | null = null
let sharedCompaniesCache: { data: SharedCompany[]; timestamp: number } | null = null

/**
 * Fetch all tenant organizations from the backend
 */
export async function getTenants(): Promise<TenantData[]> {
  try {
    if (tenantsCache && Date.now() - tenantsCache.timestamp < CACHE_DURATION) {
      return tenantsCache.data
    }
    
    const response = await apiClient.getPlatformTenants()
    const tenants = response.data || []
    tenantsCache = { data: tenants, timestamp: Date.now() }
    return tenants
  } catch (error) {
    console.error('Failed to fetch tenants from backend:', error)
    // Return empty array on error to prevent component crashes
    return []
  }
}

/**
 * Fetch all platform users from the backend
 */
export async function getPlatformUsers(): Promise<PlatformUser[]> {
  try {
    if (platformUsersCache && Date.now() - platformUsersCache.timestamp < CACHE_DURATION) {
      return platformUsersCache.data
    }
    
    const response = await apiClient.getPlatformUsers()
    const users = response.data || []
    platformUsersCache = { data: users, timestamp: Date.now() }
    return users
  } catch (error) {
    console.error('Failed to fetch platform users from backend:', error)
    // Return empty array on error to prevent component crashes
    return []
  }
}

/**
 * Fetch shared companies from the backend
 */
export async function getSharedCompanies(): Promise<SharedCompany[]> {
  try {
    if (sharedCompaniesCache && Date.now() - sharedCompaniesCache.timestamp < CACHE_DURATION) {
      return sharedCompaniesCache.data
    }
    
    const response = await apiClient.getSharedCompanies()
    const companies = response.data || []
    sharedCompaniesCache = { data: companies, timestamp: Date.now() }
    return companies
  } catch (error) {
    console.error('Failed to fetch shared companies from backend:', error)
    // Return empty array on error to prevent component crashes
    return []
  }
}