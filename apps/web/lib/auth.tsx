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
      // Try to use the real API first
      try {
        const { apiClient } = await import('./api-client');
        const response = await apiClient.login(email, password);
        
        if (response.accessToken && response.user) {
          // Convert API user format to our app's user format
          const apiUser = response.user;
          
          // Determine role from API roles array or fall back to mock data
          let userRole: UserRoleName = 'user'; // default
          
          if (apiUser.roles && apiUser.roles.length > 0) {
            // Use the first role from the API response
            const primaryRole = apiUser.roles[0].name;
            // Map database role names to our UserRoleName type
            if (['user', 'staff', 'admin', 'customer_admin', 'platform_admin', 'customer_staff', 'customer_user'].includes(primaryRole)) {
              userRole = primaryRole as UserRoleName;
            }
          } else {
            // If no roles from API, check mock data as fallback
            const mockUser = mockUsers.find((u) => u.email === email);
            userRole = mockUser?.role || 'user' as UserRoleName;
          }
          
          const appUser: User = {
            id: apiUser.id,
            email: apiUser.email,
            name: apiUser.name,
            role: userRole,
            organization_id: apiUser.organizationId || null,
            organization: apiUser.organization ? {
              id: apiUser.organization.id,
              name: apiUser.organization.name,
              domain: '', // Not provided by API
              status: 'active' as const,
              subscription_tier: 'professional' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } : null,
            roles: apiUser.roles?.map(r => ({
              id: r.id,
              name: r.name,
              description: r.description || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              permissions: r.permissions || [],
            })),
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          setUser(appUser);
          localStorage.setItem("selly-user", JSON.stringify(appUser));
          document.cookie = `selly-user=${JSON.stringify(appUser)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          
          setIsLoading(false);
          return true;
        }
      } catch (apiError) {
        console.log('API login failed, falling back to mock auth:', apiError);
        
        // Fall back to mock authentication
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundUser = mockUsers.find((u) => u.email === email && u.password === password);

        if (foundUser) {
          const { password: _, role, ...userWithoutPassword } = foundUser;
          const userWithRole = { ...userWithoutPassword, role };
          
          setUser(userWithRole);
          localStorage.setItem("selly-user", JSON.stringify(userWithRole));
          document.cookie = `selly-user=${JSON.stringify(userWithRole)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

          setIsLoading(false);
          return true;
        }
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  }

  const logout = () => {
    // Clear API client token if it exists
    try {
      const { apiClient } = require('./api-client');
      apiClient.logout();
    } catch (error) {
      console.log('API client not available for logout:', error);
    }
    
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

export function requireAuth(requiredPermissions?: string[]) {
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

      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(user, permission))
        if (!hasRequiredPermission) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-red-600">Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p className="text-sm text-gray-600 mt-2">Required permissions: {requiredPermissions.join(" or ")}</p>
              </div>
            </div>
          )
        }
      }

      return <WrappedComponent {...props} />
    }
}

// Permission-based helper function using RBAC standard
export function hasPermission(user: User, permissionKey: string): boolean {
  if (!user.roles) return false
  
  for (const role of user.roles) {
    if (!role.permissions) continue
    
    for (const permission of role.permissions) {
      // Admin wildcard permission
      if (permission.key === '*') return true
      
      // Exact match
      if (permission.key === permissionKey) return true
      
      // Pattern matching (e.g., 'tenants:*' matches 'tenants:read', 'tenants:write')
      if (permission.key.endsWith(':*')) {
        const prefix = permission.key.slice(0, -1) // Remove '*'
        if (permissionKey.startsWith(prefix)) return true
      }
    }
  }
  
  return false
}

export function hasOrganizationAccess(user: User, organizationId?: string): boolean {
  // Platform admins with wildcard permission can access all organizations
  if (hasPermission(user, '*') || hasPermission(user, 'tenants:*')) return true
  if (!organizationId) return false
  return user.organization_id === organizationId
}

// Platform Admin specific permissions - RBAC Standard
export function canManageTenants(user: User): boolean {
  return hasPermission(user, 'tenants:manage') || hasPermission(user, '*')
}

export function canManagePlatformUsers(user: User): boolean {
  return hasPermission(user, 'users:manage') || hasPermission(user, '*')
}

export function canViewPlatformAnalytics(user: User): boolean {
  return hasPermission(user, 'analytics:view') || hasPermission(user, '*')
}

export function canManagePlatformSettings(user: User): boolean {
  return hasPermission(user, 'settings:manage') || hasPermission(user, '*')
}

export function canManageSharedData(user: User): boolean {
  return hasPermission(user, 'shared-data:manage') || hasPermission(user, '*')
}

// Organization Admin permissions - RBAC Standard
export function canManageOrganizationUsers(user: User): boolean {
  return hasPermission(user, 'org-users:manage') || hasPermission(user, '*')
}

export function canManageOrganizationPolicies(user: User): boolean {
  return hasPermission(user, 'org-policies:manage') || hasPermission(user, '*')
}

export function canManageOrganizationData(user: User): boolean {
  return hasPermission(user, 'org-data:manage') || hasPermission(user, '*')
}

export function canManageOrganizationSettings(user: User): boolean {
  return hasPermission(user, 'org-settings:manage') || hasPermission(user, '*')
}

// Staff permissions - RBAC Standard
export function canManageDatabase(user: User): boolean {
  return hasPermission(user, 'database:manage') || hasPermission(user, '*')
}

export function canViewReports(user: User): boolean {
  return hasPermission(user, 'reports:view') || hasPermission(user, '*')
}

// Data access permissions
export function canAccessSharedData(user: User): boolean {
  return true // All authenticated users can access shared data
}

export function canAccessOrganizationData(user: User, orgId?: string): boolean {
  // Platform admins with wildcard permission can access all org data
  if (hasPermission(user, '*') || hasPermission(user, 'tenants:*')) return true
  if (!orgId || !user.organization_id) return false
  return user.organization_id === orgId
}
