"use client"

import { useState } from "react"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface CompanyCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (company: Company) => void
}

export function CompanyCreateDialog({ open, onOpenChange, onSuccess }: CompanyCreateDialogProps) {
  const [formData, setFormData] = useState({
    companyNameEn: "",
    companyNameTh: "",
    businessDescription: "",
    province: "",
    websiteUrl: "",
    primaryEmail: "",
    primaryPhone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setFormData({
      companyNameEn: "",
      companyNameTh: "",
      businessDescription: "",
      province: "",
      websiteUrl: "",
      primaryEmail: "",
      primaryPhone: "",
    })
    setError(null)
    setSuccess(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.companyNameEn.trim()) {
      setError("Company name (English) is required")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Call the actual API to create company
      const createData = {
        companyNameEn: formData.companyNameEn.trim(),
        companyNameTh: formData.companyNameTh.trim() || undefined,
        businessDescription: formData.businessDescription.trim() || undefined,
        province: formData.province.trim() || undefined,
        websiteUrl: formData.websiteUrl.trim() || undefined,
        primaryEmail: formData.primaryEmail.trim() || undefined,
        primaryPhone: formData.primaryPhone.trim() || undefined,
        dataSource: 'customer_input' as const,
      }

      const newCompany = await apiClient.createCompany(createData)
      
      if (newCompany) {
        setSuccess(true)
        // Wait a moment to show success message
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(newCompany as Company)
          }
          handleOpenChange(false)
        }, 1000)
      } else {
        throw new Error("Failed to create company")
      }
    } catch (error: any) {
      console.error("Error creating company:", error)
      setError(error.message || "Failed to create company. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>Add a new company to your organization&apos;s database.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyNameEn">
                Company Name (EN) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyNameEn"
                value={formData.companyNameEn}
                onChange={(e) => updateField("companyNameEn", e.target.value)}
                placeholder="Acme Corporation"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNameTh">Company Name (TH)</Label>
              <Input
                id="companyNameTh"
                value={formData.companyNameTh}
                onChange={(e) => updateField("companyNameTh", e.target.value)}
                placeholder="บริษัท อัคมี"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => updateField("businessDescription", e.target.value)}
              placeholder="Brief description of the company's business..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => updateField("province", e.target.value)}
                placeholder="Bangkok"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => updateField("primaryEmail", e.target.value)}
                placeholder="contact@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => updateField("primaryPhone", e.target.value)}
                placeholder="+66 2 123 4567"
                disabled={isLoading}
              />
            </div>
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
            <span className="text-sm">Company created successfully!</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success}>
            {isLoading ? "Creating..." : success ? "Created!" : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
