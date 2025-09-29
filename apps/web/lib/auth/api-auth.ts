import { User, Permission } from "@/lib/types"

/**
 * API Authentication utilities for validating JWT tokens and extracting user info
 * Updated to work with proper RBAC schema (users, roles, permissions tables)
 */
export async function validateAuthHeader(authHeader: string | null): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  // In a real implementation, this would validate JWT and extract user info
  // Then load user with roles and permissions from database
  try {
    // Mock JWT validation - in production this would use proper JWT library
    if (token === 'demo-user-token') {
      return {
        id: 'user-1',
        email: 'user@selly.com',
        name: 'Demo User',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles: [
          {
            id: 'role-user',
            name: 'user',
            description: 'Regular user role',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            permissions: [
              { id: 'perm-1', key: 'company-lists:read-own', description: 'Read own company lists', created_at: '', updated_at: '' },
              { id: 'perm-2', key: 'company-lists:create', description: 'Create company lists', created_at: '', updated_at: '' },
              { id: 'perm-3', key: 'company-lists:update-own', description: 'Update own company lists', created_at: '', updated_at: '' },
              { id: 'perm-4', key: 'company-lists:delete-own', description: 'Delete own company lists', created_at: '', updated_at: '' }
            ]
          }
        ]
      }
    }
    
    if (token === 'demo-admin-token') {
      return {
        id: 'admin-1',
        email: 'admin@selly.com',
        name: 'Admin User',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles: [
          {
            id: 'role-admin',
            name: 'admin',
            description: 'Administrator role',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            permissions: [
              { id: 'perm-admin', key: '*', description: 'Full access to all resources', created_at: '', updated_at: '' }
            ]
          }
        ]
      }
    }
    
    // Invalid token
    return null
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export function hasPermission(user: User, permissionKey: string): boolean {
  if (!user.roles) return false
  
  for (const role of user.roles) {
    if (!role.permissions) continue
    
    for (const permission of role.permissions) {
      // Admin wildcard permission
      if (permission.key === '*') return true
      
      // Exact match
      if (permission.key === permissionKey) return true
      
      // Pattern matching (e.g., 'company-lists:*' matches 'company-lists:read')
      if (permission.key.endsWith(':*')) {
        const prefix = permission.key.slice(0, -1) // Remove '*'
        if (permissionKey.startsWith(prefix)) return true
      }
    }
  }
  
  return false
}

export function canAccessList(user: User, list: { ownerUserId: string, visibility: string }): boolean {
  // Owner can always access
  if (list.ownerUserId === user.id) {
    return true
  }
  
  // Check admin permissions
  if (hasPermission(user, '*') || hasPermission(user, 'company-lists:*')) {
    return true
  }
  
  // Public lists are accessible by all authenticated users
  if (list.visibility === 'public' && hasPermission(user, 'company-lists:read-public')) {
    return true
  }
  
  // Org lists are accessible by users with org read permission
  if (list.visibility === 'org' && hasPermission(user, 'company-lists:read-org')) {
    return true
  }
  
  return false
}

// Helper function for backward compatibility with old role-based logic
export function getUserRoleName(user: User): string | null {
  if (!user.roles || user.roles.length === 0) return null
  
  // Return the first role name for backward compatibility
  const roleNames = user.roles.map(r => r.name.toLowerCase())
  
  if (roleNames.includes('admin')) return 'admin'
  if (roleNames.includes('staff')) return 'staff'
  if (roleNames.includes('user')) return 'user'
  
  return roleNames[0] || null
}