"use client"

import { useState, useEffect } from "react"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth, canEditSharedData } from "@/lib/auth"

interface CompanyEditDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (company: Company) => void
}

export function CompanyEditDialog({ company, open, onOpenChange, onSave }: CompanyEditDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<Company>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Check if user can edit this company
  const canEdit = company?.isSharedData ? (user ? canEditSharedData(user) : false) : true
  const isOwner = user?.organizationId && company?.organizationId === user.organizationId
  // Verification status rules:
  // - For non-shared data (isSharedData = false): always allow editing
  // - For shared data (isSharedData = true): only platform admins can edit
  const canSetVerificationStatus = !company?.isSharedData || (user && canEditSharedData(user))

  useEffect(() => {
    if (company) {
      setFormData({ ...company })
      setError(null)
      setSuccess(false)
    }
  }, [company])

  const handleSubmit = async () => {
    if (!formData.id) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Call the actual API to update company
      // Map frontend field names to backend DTO field names
      const updateData: any = {}
      
      if (formData.companyNameEn !== undefined) updateData.companyNameEn = formData.companyNameEn
      if (formData.companyNameTh !== undefined) updateData.companyNameTh = formData.companyNameTh
      if (formData.registrationId !== undefined) updateData.primaryRegistrationNo = formData.registrationId
      if (formData.businessDescription !== undefined) updateData.businessDescription = formData.businessDescription
      if (formData.addressLine1 !== undefined) updateData.addressLine1 = formData.addressLine1
      if (formData.addressLine2 !== undefined) updateData.addressLine2 = formData.addressLine2
      if (formData.district !== undefined) updateData.district = formData.district
      if (formData.subdistrict !== undefined) updateData.subdistrict = formData.subdistrict
      if (formData.provinceDetected !== undefined) updateData.province = formData.provinceDetected
      if (formData.postalCode !== undefined) updateData.postalCode = formData.postalCode
      if (formData.countryCode !== undefined) updateData.countryCode = formData.countryCode
      if (formData.websiteUrl !== undefined) updateData.websiteUrl = formData.websiteUrl
      if (formData.primaryEmail !== undefined) updateData.primaryEmail = formData.primaryEmail
      if (formData.primaryPhone !== undefined) updateData.primaryPhone = formData.primaryPhone
      if (formData.companySize !== undefined) updateData.companySize = formData.companySize
      if (formData.employeeCountEstimate !== undefined) updateData.employeeCountEstimate = formData.employeeCountEstimate
      if (formData.tags !== undefined) updateData.tags = formData.tags
      if (formData.dataSensitivity !== undefined) updateData.dataSensitivity = formData.dataSensitivity
      
      // Allow organization owners and platform admins (on shared data) to update verification status
      if (canSetVerificationStatus && formData.verificationStatus !== undefined) {
        updateData.verificationStatus = formData.verificationStatus
      }

      const updatedCompany = await apiClient.updateCompany(formData.id, updateData)
      
      if (updatedCompany) {
        setSuccess(true)
        // Wait a moment to show success message
        setTimeout(() => {
          onSave(updatedCompany as Company)
          onOpenChange(false)
        }, 1000)
      } else {
        throw new Error("Failed to update company")
      }
    } catch (error: any) {
      console.error("Error updating company:", error)
      setError(error.message || "Failed to update company. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof Company, value: any) => {
    setFormData((prev: Partial<Company>) => ({ ...prev, [field]: value }))
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company Record</DialogTitle>
          <DialogDescription>Update company information and contact details.</DialogDescription>
        </DialogHeader>

        {company?.isSharedData && !canEdit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Cannot Edit Shared Data</p>
              <p className="text-red-700 mt-1">
                This company is from a shared data source and cannot be edited. Only platform admins can edit shared data.
              </p>
            </div>
          </div>
        )}
        
        {company?.isSharedData && canEdit && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Editing Shared Data</p>
              <p className="text-blue-700 mt-1">
                You have platform admin privileges to edit this shared data. Changes will affect all organizations using this data.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (EN)</Label>
                <Input
                  id="companyName"
                  value={formData.companyNameEn || ""}
                  onChange={(e) => updateField("companyNameEn", e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationId">Registered Number</Label>
                <Input
                  id="registrationId"
                  value={formData.registrationId || ""}
                  onChange={(e) => updateField("registrationId", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNameTh">Company Name (TH)</Label>
              <Input
                id="companyNameTh"
                value={formData.companyNameTh || ""}
                onChange={(e) => updateField("companyNameTh", e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Input
                id="businessDescription"
                value={formData.businessDescription || ""}
                onChange={(e) => updateField("businessDescription", e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryEmail">Primary Email</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={formData.primaryEmail || ""}
                  onChange={(e) => updateField("primaryEmail", e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input
                  id="primaryPhone"
                  value={formData.primaryPhone || ""}
                  onChange={(e) => updateField("primaryPhone", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl || ""}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1 || ""}
                onChange={(e) => updateField("addressLine1", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2 || ""}
                onChange={(e) => updateField("addressLine2", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district || ""}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Watthana"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdistrict">Sub-district</Label>
                <Input
                  id="subdistrict"
                  value={formData.subdistrict || ""}
                  onChange={(e) => updateField("subdistrict", e.target.value)}
                  placeholder="Khlong Toei Nuea"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provinceDetected">Province</Label>
                <Input
                  id="provinceDetected"
                  value={formData.provinceDetected || ""}
                  onChange={(e) => updateField("provinceDetected", e.target.value)}
                  placeholder="Bangkok"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ""}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="10110"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Country</Label>
                <Input
                  id="countryCode"
                  value={formData.countryCode || ""}
                  onChange={(e) => updateField("countryCode", e.target.value)}
                  maxLength={2}
                  placeholder="TH"
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize || ""} onValueChange={(value) => updateField("companySize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Micro</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCountEstimate">Employee Count</Label>
                <Input
                  id="employeeCountEstimate"
                  type="number"
                  value={formData.employeeCountEstimate || ""}
                  onChange={(e) => updateField("employeeCountEstimate", parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSensitivity">Data Sensitivity</Label>
              <Select
                value={formData.dataSensitivity || ""}
                onValueChange={(value) => updateField("dataSensitivity", value)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verification Status - For data owners and platform admins on shared data */}
          {canSetVerificationStatus && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Data Verification</h3>
              <div className="space-y-2">
                <Label htmlFor="verificationStatus">Verification Status</Label>
                <Select
                  value={formData.verificationStatus || ""}
                  onValueChange={(value) => updateField("verificationStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {isOwner 
                    ? "As the data owner, you can set the verification status for this company."
                    : "As a platform admin, you can set the verification status for this shared data."}
                </p>
              </div>
            </div>
          )}

          {/* Contact Persons - Removed per requirement #2: Contacts have their own CRUD box */}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Company updated successfully!</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {!canEdit ? "Close" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success || !canEdit}>
            {isLoading ? "Saving..." : success ? "Saved!" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
