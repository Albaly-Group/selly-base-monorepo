"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole, UserRoleName } from "./types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("selly-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        
        // if (!userData.roles && userData.role) {
        //   const mockRoles = [];
        //   if (userData.role === 'platform_admin') {
        //     mockRoles.push({
        //       id: 'role_platform_admin',
        //       name: 'platform_admin',
        //       description: 'Platform Administrator',
        //       created_at: new Date().toISOString(),
        //       updated_at: new Date().toISOString(),
        //       permissions: [
        //         {
        //           id: 'perm_wildcard',
        //           key: '*',
        //           description: 'Full platform access',
        //           created_at: new Date().toISOString(),
        //           updated_at: new Date().toISOString(),
        //         }
        //       ]
        //     });
        //   } else if (userData.role === 'customer_admin') {
        //     mockRoles.push({
        //       id: 'role_customer_admin',
        //       name: 'customer_admin',
        //       description: 'Customer Administrator',
        //       created_at: new Date().toISOString(),
        //       updated_at: new Date().toISOString(),
        //       permissions: [
        //         { id: 'perm_org', key: 'org:*', description: 'Organization access', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        //         { id: 'perm_users', key: 'users:*', description: 'User management', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        //         { id: 'perm_lists', key: 'lists:*', description: 'List management', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        //         { id: 'perm_projects', key: 'projects:*', description: 'Project access', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        //       ]
        //     });
        //   }
        //   userData.roles = mockRoles;
          
        //   localStorage.setItem("selly-user", JSON.stringify(userData))
        // }
        
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
      try {
        const { apiClient } = await import('./api-client');
        const response = await apiClient.login(email, password);
        
        if (response.accessToken && response.user) {

          const apiUser = response.user;
          let userRole: UserRoleName = 'user';
          
          if (apiUser.roles && apiUser.roles.length > 0) {

            const primaryRole = apiUser.roles[0].name;
            if (['user', 'staff', 'admin', 'customer_admin', 'platform_admin', 'customer_staff', 'customer_user'].includes(primaryRole)) {
              userRole = primaryRole as UserRoleName;
            }
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
              domain: '',
              status: 'active' as const,
              slug: apiUser.organization.slug || '',
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
        return false;
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
      const { user, logout, isLoading } = useAuth()

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
                <div className="pt-4">
                  <Button variant="ghost" onClick={logout}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </div>
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
