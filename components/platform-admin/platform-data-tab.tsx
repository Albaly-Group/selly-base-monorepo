"use client"

import { useState } from "react"
import { useAuth, canManageSharedData } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Database, Plus, MoreHorizontal, Upload, Download, Eye, Edit, Globe, Building } from "lucide-react"
import { mockSharedCompanies, type SharedCompany } from "@/lib/platform-admin-data"

export function PlatformDataTab() {
  const { user } = useAuth()
  const [sharedCompanies] = useState<SharedCompany[]>(mockSharedCompanies)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Check permissions
  if (!user || !canManageSharedData(user)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don't have permission to manage shared data. This feature requires platform admin privileges.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Needs Verification": return "bg-yellow-100 text-yellow-800"
      case "Invalid": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleAddCompany = () => {
    setShowAddCompany(false)
  }

  const handleBulkImport = () => {
    setShowImportDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shared Data Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage company data that is shared across all tenant organizations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Import Shared Companies</DialogTitle>
                <DialogDescription>
                  Import company data from external sources like DBD warehouse
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Drop files here or click to upload
                        </span>
                      </label>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      CSV, Excel files up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                <Button onClick={handleBulkImport}>Import Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Shared Company</DialogTitle>
                <DialogDescription>
                  Add a new company that will be available to all tenants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name (English)</Label>
                  <Input placeholder="ABC Company Limited" />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input placeholder="Manufacturing" />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input placeholder="Bangkok" />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input placeholder="0105564111698" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddCompany(false)}>Cancel</Button>
                <Button onClick={handleAddCompany}>Add Company</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shared Companies</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">
              Available to all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,156</div>
            <p className="text-xs text-muted-foreground">
              93.2% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Review</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,875</div>
            <p className="text-xs text-muted-foreground">
              Pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours</div>
            <p className="text-xs text-muted-foreground">
              From DBD warehouse
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="shared" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shared">Shared Companies</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <CardTitle>Shared Company Database</CardTitle>
              <CardDescription>
                Companies available to all tenant organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead>Tenant Access</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">{company.companyNameEn}</div>
                            <div className="text-sm text-muted-foreground">{company.registeredNo}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{company.industrialName}</TableCell>
                      <TableCell>{company.province}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.verificationStatus)}>
                          {company.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${company.dataCompleteness}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{company.dataCompleteness}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {company.tenantCount} tenants
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(company.lastUpdated)}</TableCell>
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
                            <DropdownMenuItem>
                              <Edit className="h-3 w-3 mr-2" />
                              Edit Company
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-3 w-3 mr-2" />
                              Export Data
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
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Companies requiring verification before being shared
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No companies pending review at this time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                External data sources and synchronization status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">DBD Data Warehouse</h3>
                      <p className="text-sm text-muted-foreground">Official company registrations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <span className="text-sm text-muted-foreground">Last sync: 2h ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}