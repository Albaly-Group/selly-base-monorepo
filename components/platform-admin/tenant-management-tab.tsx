"use client"

import { useState } from "react"
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

interface TenantData extends Organization {
  user_count: number
  data_count: number
  last_activity: string
}

export function TenantManagementTab() {
  const [tenants, setTenants] = useState<TenantData[]>([
    {
      id: "org_customer1",
      name: "Customer Company 1",
      domain: "customer1.com", 
      status: "active",
      subscription_tier: "professional",
      user_count: 15,
      data_count: 2847,
      last_activity: "2024-12-08T14:30:00Z",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-12-08T14:30:00Z",
    },
    {
      id: "org_customer2", 
      name: "Global Manufacturing Inc",
      domain: "globalmanuf.com",
      status: "active",
      subscription_tier: "enterprise", 
      user_count: 45,
      data_count: 8934,
      last_activity: "2024-12-08T13:15:00Z",
      created_at: "2024-02-20T09:30:00Z",
      updated_at: "2024-12-08T13:15:00Z",
    },
    {
      id: "org_customer3",
      name: "Tech Solutions Ltd",
      domain: "techsolutions.co.th",
      status: "inactive", 
      subscription_tier: "basic",
      user_count: 3,
      data_count: 456,
      last_activity: "2024-11-20T16:45:00Z",
      created_at: "2024-05-10T14:20:00Z", 
      updated_at: "2024-11-20T16:45:00Z",
    }
  ])

  const [showAddTenant, setShowAddTenant] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantData | null>(null)

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
                  <TableCell className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {tenant.user_count}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    {tenant.data_count.toLocaleString()}
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