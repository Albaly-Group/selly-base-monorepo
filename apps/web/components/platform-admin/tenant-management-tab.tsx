"use client"

import { useState } from "react"
import { useAuth, canManageTenants } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Plus, MoreHorizontal, Users, Database, Settings, Eye, Edit } from "lucide-react"
import type { Organization } from "@/lib/types"
import { mockTenantData, type TenantData, validateOrganizationData } from "@/lib/platform-admin-data"

export function TenantManagementTab() {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<TenantData[]>(mockTenantData.filter(validateOrganizationData))
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantData | null>(null)

  // Check permissions
  if (!user || !canManageTenants(user)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have permission to manage tenants. This feature requires platform admin privileges.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "suspended": return "bg-red-100 text-red-800" 
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic": return "bg-blue-100 text-blue-800"
      case "professional": return "bg-purple-100 text-purple-800"
      case "enterprise": return "bg-gold-100 text-gold-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleAddTenant = () => {
    // Mock add tenant functionality
    setShowAddTenant(false)
  }

  const handleEditTenant = (tenant: TenantData) => {
    setEditingTenant(tenant)
  }

  const handleToggleStatus = (tenantId: string) => {
    setTenants(tenants.map(t => t.id === tenantId ? {
      ...t,
      status: t.status === "active" ? "inactive" : "active"
    } as TenantData : t))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tenant Organizations</h2>
          <p className="text-sm text-muted-foreground">
            Manage customer organizations and their subscriptions
          </p>
        </div>
        <Dialog open={showAddTenant} onOpenChange={setShowAddTenant}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant Organization</DialogTitle>
              <DialogDescription>
                Create a new customer organization with admin access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input placeholder="Company Name Ltd." />
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input placeholder="company.com" />
              </div>
              <div className="space-y-2">
                <Label>Subscription Tier</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input placeholder="admin@company.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input placeholder="Admin User" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTenant(false)}>Cancel</Button>
              <Button onClick={handleAddTenant}>Create Tenant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenant Organizations</CardTitle>
          <CardDescription>
            Overview of all customer organizations in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Data Records</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-muted-foreground">{tenant.domain}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTierColor(tenant.subscription_tier!)}>
                      {tenant.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {tenant.user_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      {tenant.data_count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(tenant.last_activity)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTenant(tenant)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-3 w-3 mr-2" />
                          Manage Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(tenant.id)}
                          className={tenant.status === "active" ? "text-red-600" : "text-green-600"}
                        >
                          {tenant.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}