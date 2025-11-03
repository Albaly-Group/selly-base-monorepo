"use client"

import { useState, useEffect } from "react"
import { useAuth, canManageOrganizationUsers } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Edit2, Trash2, Mail, AlertTriangle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "staff" | "customer_admin"
  status: "active" | "suspended"
  lastLogin: string
  createdAt: string
}

export function UserManagementTab() {
  const { user: currentUser } = useAuth()
  
  // Initialize all hooks first (must be called unconditionally)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // State for error handling
  const [error, setError] = useState<string | null>(null)

  // State for add user form
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isCreating, setIsCreating] = useState(false)

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching organization users...')
        const response = await apiClient.getOrganizationUsers()
        console.log('API Response:', response)
        if (response.data) {
          console.log('Users data:', response.data)
          setUsers(response.data)
        } else {
          console.log('No users data in response')
          setUsers([])
        }
      } catch (error) {
        console.error('Failed to fetch organization users:', error)
        setError('Failed to load organization users. Please ensure the backend is running.')
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    console.log('Current user:', currentUser)
    console.log('Organization:', currentUser?.organization)
    console.log('Organization ID:', currentUser?.organization_id)
    
    if (currentUser?.organization_id || currentUser?.organization?.id) {
      fetchUsers()
    } else {
      console.log('No organization ID found, skipping fetch')
      setIsLoading(false)
    }
  }, [currentUser?.organization_id, currentUser?.organization?.id])

  const refreshUsers = async () => {
    try {
      const response = await apiClient.getOrganizationUsers()
      if (response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Failed to refresh users:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.deleteOrganizationUser(userId)
      await refreshUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleCreateUser = async (userData: { name: string, email: string, role: string, password: string }) => {
    try {
      setIsCreating(true)
      setFormErrors({})
      
      // Basic validation
      const errors: {[key: string]: string} = {}
      if (!userData.name.trim()) errors.name = 'Name is required'
      if (!userData.email.trim()) errors.email = 'Email is required'
      if (!userData.role) errors.role = 'Role is required'
      if (!userData.password.trim()) errors.password = 'Password is required'
      if (userData.password.length < 6) errors.password = 'Password must be at least 6 characters'
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (userData.email && !emailRegex.test(userData.email)) {
        errors.email = 'Please enter a valid email address'
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      
      await apiClient.createOrganizationUser(userData)
      await refreshUsers()
      setShowAddUser(false)
      setNewUserForm({ name: '', email: '', role: '', password: '' })
    } catch (error) {
      console.error('Failed to create user:', error)
      setFormErrors({ general: 'Failed to create user. Please try again.' })
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setNewUserForm({ name: '', email: '', role: '', password: '' })
    setFormErrors({})
  }

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await apiClient.updateOrganizationUser(userId, userData)
      await refreshUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "customer_admin": return "bg-red-100 text-red-800"
      case "staff": return "bg-blue-100 text-blue-800"
      case "user": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (user) {
        const newStatus = user.status === "active" ? "suspended" : "active"
        await apiClient.updateOrganizationUser(userId, { status: newStatus })
        await refreshUsers()
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  // Check permissions after all hooks
  if (!currentUser || !canManageOrganizationUsers(currentUser)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have permission to manage organization users.</p>
            <p className="text-sm mt-2">This feature requires customer admin privileges within your organization.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error UI if API failed
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2 text-red-800">Failed to Load Users</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Users...</h3>
            <p className="text-gray-600">Fetching organization users</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === "active").length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === "customer_admin").length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === "staff").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <Dialog open={showAddUser} onOpenChange={(open) => {
              setShowAddUser(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account and assign permissions
                  </DialogDescription>
                </DialogHeader>
                {formErrors.general && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {formErrors.general}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter full name" 
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter email address" 
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter password (min 6 characters)" 
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                      className={formErrors.password ? 'border-red-500' : ''}
                    />
                    {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_user">User</SelectItem>
                        <SelectItem value="customer_staff">Staff</SelectItem>
                        <SelectItem value="customer_admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.role && <p className="text-red-500 text-sm">{formErrors.role}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleCreateUser(newUserForm)}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No users found</h3>
                      <p className="text-sm">There are no users in your organization yet.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowAddUser(true)}
                        variant="outline"
                      >
                        Add your first user
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.lastLogin)}</TableCell>
                    <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}