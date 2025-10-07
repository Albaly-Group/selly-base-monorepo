"use client"

import { useState, useEffect } from "react"
import type { Company, ContactPerson } from "@/lib/types"
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
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface CompanyEditDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (company: Company) => void
}

export function CompanyEditDialog({ company, open, onOpenChange, onSave }: CompanyEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Company>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addContactPerson = () => {
    const newContact: ContactPerson = { name: "", phone: "", email: "" }
    updateField("contactPersons", [...(formData.contactPersons || []), newContact])
  }

  const updateContactPerson = (index: number, field: keyof ContactPerson, value: string) => {
    const contacts = [...(formData.contactPersons || [])]
    contacts[index] = { ...contacts[index], [field]: value }
    updateField("contactPersons", contacts)
  }

  const removeContactPerson = (index: number) => {
    const contacts = [...(formData.contactPersons || [])]
    contacts.splice(index, 1)
    updateField("contactPersons", contacts)
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company Record</DialogTitle>
          <DialogDescription>Update company information and contact details.</DialogDescription>
        </DialogHeader>

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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationId">Registered Number</Label>
                <Input
                  id="registrationId"
                  value={formData.registrationId || ""}
                  onChange={(e) => updateField("registrationId", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNameTh">Company Name (TH)</Label>
              <Input
                id="companyNameTh"
                value={formData.companyNameTh || ""}
                onChange={(e) => updateField("companyNameTh", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Input
                id="businessDescription"
                value={formData.businessDescription || ""}
                onChange={(e) => updateField("businessDescription", e.target.value)}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input
                  id="primaryPhone"
                  value={formData.primaryPhone || ""}
                  onChange={(e) => updateField("primaryPhone", e.target.value)}
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

          {/* Contact Persons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Contact Persons</h3>
              <Button type="button" variant="outline" size="sm" onClick={addContactPerson}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {formData.contactPersons?.map((contact, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Contact {index + 1}</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeContactPerson(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={contact.name} onChange={(e) => updateContactPerson(index, "name", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={contact.phone || ""}
                      onChange={(e) => updateContactPerson(index, "phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email || ""}
                      onChange={(e) => updateContactPerson(index, "email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!formData.contactPersons || formData.contactPersons.length === 0) && (
              <div className="text-center py-6 text-gray-500">No contact persons added yet.</div>
            )}
          </div>
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
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success}>
            {isLoading ? "Saving..." : success ? "Saved!" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
