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
    email: "user@customer1.com",
    name: "John Customer",
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
    email: "admin@customer1.com", 
    name: "Jane Customer Admin",
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
    id: "3",
    email: "staff@selly.com",
    name: "Staff User",
    role: "staff", // Legacy role for backward compatibility
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
    id: "4",
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

export function requireAuth(allowedRoles?: (UserRole | UserRoleName)[]) {
  return (WrappedComponent: React.ComponentType<any>) =>
    function AuthenticatedComponent(props: any) {
      const { user, isLoading } = useAuth()

      if (isLoading) {
        return <div>Loading...</div>
      }

      if (!user) {
        return <div>Please log in to access this page.</div>
      }

      if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        return <div>You don&apos;t have permission to access this page.</div>
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
