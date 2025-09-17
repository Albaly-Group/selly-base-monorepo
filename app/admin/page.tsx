"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Settings, Shield, FileText, Clock, AlertTriangle, Plus, Edit, Trash2 } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "Sales Rep" | "Sales Manager" | "Workspace Admin" | "Analyst"
  status: "Active" | "Inactive"
  lastLogin: string
  createdAt: string
}

interface PolicySetting {
  id: string
  name: string
  description: string
  value: string | boolean | number
  type: "boolean" | "select" | "number" | "text"
  options?: string[]
}

interface AuditLogEntry {
  id: string
  action: string
  user: string
  resource: string
  timestamp: string
  details: string
}

// Mock data
const mockUsers: AdminUser[] = [
  {
    id: "1",
    email: "john.doe@company.com", 
    name: "John Doe",
    role: "Sales Manager",
    status: "Active",
    lastLogin: "2024-12-08T10:30:00Z",
    createdAt: "2024-11-01T00:00:00Z"
  },
  {
    id: "2",
    email: "jane.smith@company.com",
    name: "Jane Smith", 
    role: "Sales Rep",
    status: "Active",
    lastLogin: "2024-12-08T09:15:00Z",
    createdAt: "2024-11-15T00:00:00Z"
  },
  {
    id: "3",
    email: "admin@company.com",
    name: "Admin User",
    role: "Workspace Admin",
    status: "Active", 
    lastLogin: "2024-12-08T11:00:00Z",
    createdAt: "2024-10-01T00:00:00Z"
  }
]

const mockPolicies: PolicySetting[] = [
  {
    id: "export_permission",
    name: "Export Permissions",
    description: "Who can export company data",
    value: "manager_admin",
    type: "select",
    options: ["rep_own", "manager_admin", "admin_only"]
  },
  {
    id: "list_ownership",
    name: "List Ownership",
    description: "Allow reps to create lists",
    value: true,
    type: "boolean"
  },
  {
    id: "data_retention_days",
    name: "Data Retention (days)",
    description: "Auto-archive invalid records after N days",
    value: 180,
    type: "number"
  },
  {
    id: "max_export_records",
    name: "Max Export Records",
    description: "Maximum records per export",
    value: 10000,
    type: "number"
  }
]

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    action: "Export Created",
    user: "john.doe@company.com",
    resource: "Bangkok Logistics Leads",
    timestamp: "2024-12-08T10:30:00Z",
    details: "Exported 245 records to Excel format"
  },
  {
    id: "2", 
    action: "User Created",
    user: "admin@company.com",
    resource: "jane.smith@company.com",
    timestamp: "2024-12-08T09:00:00Z", 
    details: "Created new Sales Rep user"
  },
  {
    id: "3",
    action: "Company Updated",
    user: "jane.smith@company.com",
    resource: "ABC Manufacturing Co., Ltd.",
    timestamp: "2024-12-08T08:45:00Z",
    details: "Updated verification status to Active"
  }
]

function AdminPage() {
  const [users, setUsers] = useState(mockUsers)
  const [policies, setPolicies] = useState(mockPolicies)
  const [showAddUser, setShowAddUser] = useState(false)

  const handlePolicyChange = (policyId: string, newValue: any) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId ? { ...policy, value: newValue } : policy
    ))
  }

  const getRoleBadgeVariant = (role: AdminUser["role"]) => {
    switch (role) {
      case "Workspace Admin": return "default"
      case "Sales Manager": return "secondary" 
      case "Sales Rep": return "outline"
      case "Analyst": return "outline"
      default: return "outline"
    }
  }

  const getStatusBadgeVariant = (status: AdminUser["status"]) => {
    return status === "Active" ? "default" : "destructive"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, policies, and system configuration</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts and role assignments
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddUser(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Role Permissions Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
                <CardDescription>
                  Overview of permissions by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sales Rep</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• View assigned lists</li>
                      <li>• Update contact outcomes</li>
                      <li>• Add notes/activities</li>
                      <li>• Export own lists (if allowed)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sales Manager</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Create lists</li>
                      <li>• Define scoring presets</li>
                      <li>• Assign to reps</li>
                      <li>• Export any data</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Workspace Admin</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Manage users</li>
                      <li>• Data import/export</li>
                      <li>• Configure scoring weights</li>
                      <li>• Full access</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Analyst</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Read-only data access</li>
                      <li>• View reports</li>
                      <li>• Save filters</li>
                      <li>• Export for analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Policies
                </CardTitle>
                <CardDescription>
                  Configure system-wide policies and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{policy.name}</h4>
                        <p className="text-sm text-gray-600">{policy.description}</p>
                      </div>
                      <div className="w-48">
                        {policy.type === "boolean" && (
                          <Switch
                            checked={policy.value as boolean}
                            onCheckedChange={(checked) => handlePolicyChange(policy.id, checked)}
                          />
                        )}
                        {policy.type === "select" && (
                          <Select
                            value={policy.value as string}
                            onValueChange={(value) => handlePolicyChange(policy.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {policy.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option === "rep_own" ? "Rep (Own Lists)" :
                                   option === "manager_admin" ? "Manager & Admin" :
                                   option === "admin_only" ? "Admin Only" : option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {policy.type === "number" && (
                          <Input
                            type="number"
                            value={policy.value as number}
                            onChange={(e) => handlePolicyChange(policy.id, parseInt(e.target.value))}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>
                    Configure automatic data cleanup policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Invalid Record Retention (days)</Label>
                    <Input type="number" defaultValue="180" />
                    <p className="text-sm text-gray-600">
                      Automatically archive invalid records after this many days
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>PII Retention (days)</Label>
                    <Input type="number" defaultValue="2555" />
                    <p className="text-sm text-gray-600">
                      Remove personal information after this period (PDPA compliance)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Export File Retention (days)</Label>
                    <Input type="number" defaultValue="30" />
                    <p className="text-sm text-gray-600">
                      Keep export files available for download
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    Update Retention Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Data Quality
                  </CardTitle>
                  <CardDescription>
                    Monitor and maintain data quality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">156</div>
                      <div className="text-sm text-red-700">Invalid Records</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">234</div>
                      <div className="text-sm text-yellow-700">Need Verification</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Run Data Validation
                    </Button>
                    <Button variant="outline" className="w-full">
                      Archive Stale Records
                    </Button>
                    <Button variant="outline" className="w-full">
                      Duplicate Detection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>
                  Track all user actions and system changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminPage