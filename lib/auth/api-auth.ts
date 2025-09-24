import { User } from "@/lib/types"

/**
 * API Authentication utilities for validating JWT tokens and extracting user info
 */
export async function validateAuthHeader(authHeader: string | null): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  // In a real implementation, this would validate JWT and extract user info
  // For now, we'll use a simple mock implementation
  try {
    // Mock JWT validation - in production this would use proper JWT library
    if (token === 'demo-user-token') {
      return {
        id: 'user-1',
        email: 'user@selly.com',
        name: 'Demo User',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    }
    
    if (token === 'demo-admin-token') {
      return {
        id: 'admin-1',
        email: 'admin@selly.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    }
    
    // Invalid token
    return null
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export function hasPermission(user: User, resource: string, action: string): boolean {
  // Basic RBAC logic
  if (user.role === 'admin') {
    return true // Admin has all permissions
  }
  
  if (user.role === 'staff') {
    // Staff can read all company lists but only manage their own
    if (resource === 'company-list' && ['read', 'create'].includes(action)) {
      return true
    }
  }
  
  if (user.role === 'user') {
    // Users can only manage their own lists
    if (resource === 'company-list' && ['read', 'create', 'update', 'delete'].includes(action)) {
      return true
    }
  }
  
  return false
}

export function canAccessList(user: User, list: { ownerUserId: string, visibility: string }): boolean {
  // Owner can always access
  if (list.ownerUserId === user.id) {
    return true
  }
  
  // Admin can access all lists
  if (user.role === 'admin') {
    return true
  }
  
  // Public lists are accessible by all authenticated users
  if (list.visibility === 'public') {
    return true
  }
  
  // Org lists are accessible by staff and admin
  if (list.visibility === 'org' && ['staff', 'admin'].includes(user.role)) {
    return true
  }
  
  return false
}