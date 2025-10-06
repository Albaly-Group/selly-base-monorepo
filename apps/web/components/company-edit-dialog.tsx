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
      const updateData = {
        companyNameEn: formData.companyNameEn,
        companyNameTh: formData.companyNameTh,
        businessDescription: formData.businessDescription,
        province: formData.province,
        websiteUrl: formData.websiteUrl,
        primaryEmail: formData.primaryEmail,
        primaryPhone: formData.primaryPhone,
        tags: formData.tags,
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
                <Label htmlFor="registeredNo">Registered Number</Label>
                <Input
                  id="registeredNo"
                  value={formData.registeredNo || ""}
                  onChange={(e) => updateField("registeredNo", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industrialName || ""}
                  onChange={(e) => updateField("industrialName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province || ""}
                  onChange={(e) => updateField("province", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize || ""} onValueChange={(value) => updateField("companySize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Small (S)</SelectItem>
                    <SelectItem value="M">Medium (M)</SelectItem>
                    <SelectItem value="L">Large (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Verification Status</Label>
                <Select
                  value={formData.verificationStatus || ""}
                  onValueChange={(value) => updateField("verificationStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Needs Verification">Needs Verification</SelectItem>
                    <SelectItem value="Invalid">Invalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
