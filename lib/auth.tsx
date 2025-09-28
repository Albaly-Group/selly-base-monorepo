"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole, UserRoleName } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for authentication - Updated for multi-tenant
const mockUsers: (User & { password: string; role: UserRoleName })[] = [
  {
    id: "1",
    email: "user@selly.com",
    name: "John User",
    role: "user", // Legacy role for backward compatibility 
    organization_id: "org_customer1",
    organization: {
      id: "org_customer1",
      name: "Customer Company 1",
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    password: "password123",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "staff@selly.com", 
    name: "Jane Staff",
    role: "staff",
    organization_id: "org_customer1",
    organization: {
      id: "org_customer1", 
      name: "Customer Company 1",
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    password: "staff123",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "admin@selly.com",
    name: "Legacy Admin",
    role: "admin", // Legacy role for backward compatibility
    organization_id: "org_customer1", 
    organization: {
      id: "org_customer1",
      name: "Customer Company 1", 
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    password: "admin123",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    email: "admin@customer1.com",
    name: "Customer Admin",
    role: "customer_admin",
    organization_id: "org_customer1",
    organization: {
      id: "org_customer1",
      name: "Customer Company 1",
      domain: "customer1.com",
      status: "active",
      subscription_tier: "professional", 
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    password: "admin123",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    email: "platform@albaly.com",
    name: "Platform Admin",
    role: "platform_admin",
    organization_id: null, // Platform admins don't belong to a specific tenant
    organization: null,
    password: "platform123",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("selly-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        if (!document.cookie.includes("selly-user=")) {
          document.cookie = `selly-user=${JSON.stringify(userData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      } catch (error) {
        localStorage.removeItem("selly-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, role, ...userWithoutPassword } = foundUser
        const userWithRole = { ...userWithoutPassword, role }
        
        setUser(userWithRole)
        localStorage.setItem("selly-user", JSON.stringify(userWithRole))
        document.cookie = `selly-user=${JSON.stringify(userWithRole)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("selly-user")

    document.cookie = "selly-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function requireAuth(allowedRoles?: UserRoleName[]) {
  return (WrappedComponent: React.ComponentType<any>) =>
    function AuthenticatedComponent(props: any) {
      const { user, isLoading } = useAuth()

      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
          </div>
        )
      }

      if (!user) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
              <p>Please log in to access this page.</p>
            </div>
          </div>
        )
      }

      if (allowedRoles && user.role && !allowedRoles.includes(user.role as UserRoleName)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Access Denied</h2>
              <p>You don't have permission to access this page.</p>
              <p className="text-sm text-gray-600 mt-2">Required role: {allowedRoles.join(" or ")}</p>
              <p className="text-sm text-gray-600">Your role: {user.role}</p>
            </div>
          </div>
        )
      }

      return <WrappedComponent {...props} />
    }
}

// Multi-tenant utility functions  
export function isPlatformAdmin(user: User): boolean {
  return user.role === 'platform_admin'
}

export function isCustomerAdmin(user: User): boolean {
  return user.role === 'customer_admin' || user.role === 'admin' // backward compatibility
}

export function isLegacyAdmin(user: User): boolean {
  return user.role === 'admin'
}

export function hasOrganizationAccess(user: User, organizationId?: string): boolean {
  if (isPlatformAdmin(user)) return true
  if (!organizationId) return false
  return user.organization_id === organizationId
}

// Platform Admin specific permissions
export function canManageTenants(user: User): boolean {
  return isPlatformAdmin(user)
}

export function canManagePlatformUsers(user: User): boolean {
  return isPlatformAdmin(user)
}

export function canViewPlatformAnalytics(user: User): boolean {
  return isPlatformAdmin(user)
}

export function canManagePlatformSettings(user: User): boolean {
  return isPlatformAdmin(user)
}

export function canManageSharedData(user: User): boolean {
  return isPlatformAdmin(user)
}

// Customer Admin specific permissions
export function canManageOrganizationUsers(user: User): boolean {
  return isCustomerAdmin(user) || isLegacyAdmin(user)
}

export function canManageOrganizationPolicies(user: User): boolean {
  return isCustomerAdmin(user) || isLegacyAdmin(user)
}

export function canManageOrganizationData(user: User): boolean {
  return isCustomerAdmin(user) || isLegacyAdmin(user)
}

export function canManageOrganizationSettings(user: User): boolean {
  return isCustomerAdmin(user) || isLegacyAdmin(user)
}

// Data access permissions
export function canAccessSharedData(user: User): boolean {
  return true // All authenticated users can access shared data
}

export function canAccessOrganizationData(user: User, orgId?: string): boolean {
  if (isPlatformAdmin(user)) return true // Platform admins can access all org data
  if (!orgId || !user.organization_id) return false
  return user.organization_id === orgId
}
