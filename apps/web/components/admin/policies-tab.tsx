"use client"

import { useState } from "react"
import { useAuth, canManageOrganizationPolicies } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, Download, Users, FileText, AlertTriangle } from "lucide-react"

export function PoliciesTab() {
  const { user: currentUser } = useAuth()

  // Initialize all hooks first (must be called unconditionally)
  const [policies, setPolicies] = useState({
    exportPermissions: {
      userCanExport: true,
      maxExportRecords: "1000",
      exportFormats: ["csv", "xlsx"],
      requireApproval: false
    },
    listManagement: {
      userCanCreateLists: true,
      maxListsPerUser: "10",
      listSharePermissions: "owner-only",
      autoArchiveDays: "90"
    },
    dataAccess: {
      viewAllCompanies: true,
      editCompanyData: false,
      accessDeletedRecords: false,
      downloadContactInfo: true
    },
    importPermissions: {
      allowUserImport: false,
      maxImportRows: "50000",
      requireValidation: true,
      autoDeduplication: true
    }
  })

  const handlePolicyChange = (section: string, key: string, value: any) => {
    setPolicies(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const savePolicies = () => {
    console.log("Saving policies:", policies)
    alert("Policies saved successfully!")
  }

  // Check permissions after all hooks
  if (!currentUser || !canManageOrganizationPolicies(currentUser)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have permission to manage organization policies.</p>
            <p className="text-sm mt-2">This feature requires customer admin privileges within your organization.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Policies</h2>
          <p className="text-gray-600">Configure access control and operational policies</p>
        </div>
        <Button onClick={savePolicies} className="gap-2">
          <Shield className="h-4 w-4" />
          Save Policies
        </Button>
      </div>

      {/* Export Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Permissions
          </CardTitle>
          <CardDescription>Control data export capabilities for different user roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow User Exports</Label>
              <div className="text-sm text-gray-500">Regular users can export their lists and filtered results</div>
            </div>
            <Switch 
              checked={policies.exportPermissions.userCanExport}
              onCheckedChange={(checked) => handlePolicyChange("exportPermissions", "userCanExport", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Export Records</Label>
            <Select 
              value={policies.exportPermissions.maxExportRecords}
              onValueChange={(value) => handlePolicyChange("exportPermissions", "maxExportRecords", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 records</SelectItem>
                <SelectItem value="500">500 records</SelectItem>
                <SelectItem value="1000">1,000 records</SelectItem>
                <SelectItem value="5000">5,000 records</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval for Large Exports</Label>
              <div className="text-sm text-gray-500">Exports over 1,000 records need admin approval</div>
            </div>
            <Switch 
              checked={policies.exportPermissions.requireApproval}
              onCheckedChange={(checked) => handlePolicyChange("exportPermissions", "requireApproval", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* List Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            List Management
          </CardTitle>
          <CardDescription>Configure list creation and sharing policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Users Can Create Lists</Label>
              <div className="text-sm text-gray-500">Allow regular users to create and manage their own lists</div>
            </div>
            <Switch 
              checked={policies.listManagement.userCanCreateLists}
              onCheckedChange={(checked) => handlePolicyChange("listManagement", "userCanCreateLists", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Lists Per User</Label>
            <Select 
              value={policies.listManagement.maxListsPerUser}
              onValueChange={(value) => handlePolicyChange("listManagement", "maxListsPerUser", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 lists</SelectItem>
                <SelectItem value="10">10 lists</SelectItem>
                <SelectItem value="25">25 lists</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>List Sharing Permissions</Label>
            <Select 
              value={policies.listManagement.listSharePermissions}
              onValueChange={(value) => handlePolicyChange("listManagement", "listSharePermissions", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner-only">Owner Only</SelectItem>
                <SelectItem value="team-members">Team Members</SelectItem>
                <SelectItem value="all-users">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Auto-Archive Inactive Lists</Label>
            <Select 
              value={policies.listManagement.autoArchiveDays}
              onValueChange={(value) => handlePolicyChange("listManagement", "autoArchiveDays", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Access Controls
          </CardTitle>
          <CardDescription>Define what data users can view and modify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>View All Companies</Label>
              <div className="text-sm text-gray-500">Users can see all companies in the database</div>
            </div>
            <Switch 
              checked={policies.dataAccess.viewAllCompanies}
              onCheckedChange={(checked) => handlePolicyChange("dataAccess", "viewAllCompanies", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Edit Company Data</Label>
              <div className="text-sm text-gray-500">Users can modify company information and contacts</div>
            </div>
            <Switch 
              checked={policies.dataAccess.editCompanyData}
              onCheckedChange={(checked) => handlePolicyChange("dataAccess", "editCompanyData", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Download Contact Information</Label>
              <div className="text-sm text-gray-500">Include phone numbers and emails in exports</div>
            </div>
            <Switch 
              checked={policies.dataAccess.downloadContactInfo}
              onCheckedChange={(checked) => handlePolicyChange("dataAccess", "downloadContactInfo", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Permissions</CardTitle>
          <CardDescription>Control data import capabilities and validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow User Imports</Label>
              <div className="text-sm text-gray-500">Regular users can import data to their lists</div>
            </div>
            <Switch 
              checked={policies.importPermissions.allowUserImport}
              onCheckedChange={(checked) => handlePolicyChange("importPermissions", "allowUserImport", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Import Rows</Label>
            <Select 
              value={policies.importPermissions.maxImportRows}
              onValueChange={(value) => handlePolicyChange("importPermissions", "maxImportRows", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1,000 rows</SelectItem>
                <SelectItem value="10000">10,000 rows</SelectItem>
                <SelectItem value="50000">50,000 rows</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Data Validation</Label>
              <div className="text-sm text-gray-500">All imports must pass validation checks</div>
            </div>
            <Switch 
              checked={policies.importPermissions.requireValidation}
              onCheckedChange={(checked) => handlePolicyChange("importPermissions", "requireValidation", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Deduplication</Label>
              <div className="text-sm text-gray-500">Automatically detect and merge duplicate records</div>
            </div>
            <Switch 
              checked={policies.importPermissions.autoDeduplication}
              onCheckedChange={(checked) => handlePolicyChange("importPermissions", "autoDeduplication", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}