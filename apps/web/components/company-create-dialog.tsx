"use client";

import { useState, useEffect } from "react";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { createCompanySchema } from "@/lib/validation-schemas";
import { useFormValidation } from "@/hooks/use-form-validation";

interface CompanyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (company: Company) => void;
}

export function CompanyCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CompanyCreateDialogProps) {
  const [formData, setFormData] = useState({
    companyNameEn: "",
    companyNameTh: "",
    primaryRegistrationNo: "",
    businessDescription: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    primaryIndustryId: "",
    primaryRegionId: "",
    websiteUrl: "",
    primaryEmail: "",
    primaryPhone: "",
    companySize: "small",
    employeeCountEstimate: undefined as number | undefined,
    dataSensitivity: "standard",
  });
  const [industries, setIndustries] = useState<
    Array<{ id: string; titleEn: string; titleTh: string | null }>
  >([]);
  const [regions, setRegions] = useState<
    Array<{ id: string; nameEn: string; nameTh: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { errors, validate, clearError, getError, hasError } =
    useFormValidation(createCompanySchema);

  const resetForm = () => {
    setFormData({
      companyNameEn: "",
      companyNameTh: "",
      primaryRegistrationNo: "",
      businessDescription: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      primaryIndustryId: "",
      primaryRegionId: "",
      websiteUrl: "",
      primaryEmail: "",
      primaryPhone: "",
      companySize: "small",
      employeeCountEstimate: undefined,
      dataSensitivity: "standard",
    });
    setError(null);
    setSuccess(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      const loadReferenceData = async () => {
        try {
          const [industriesData, regionsData] = await Promise.all([
            apiClient.getIndustries({ active: true }),
            apiClient.getRegionsHierarchical({
              active: true,
              countryCode: "TH",
            }),
          ]);
          const cleanIndustries = (industriesData.data || []).filter(
            (it: any) =>
              typeof it.nameEn === "string" && it.nameEn.trim() !== ""
          );

          setIndustries(cleanIndustries);
          setRegions(regionsData.data || []);
        } catch (err) {
          console.error("Failed to load reference data:", err);
        }
      };
      loadReferenceData();
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate all fields using Zod schema
    if (!validate(formData)) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the actual API to create company
      // Map frontend field names to backend DTO field names
      const createData: any = {
        companyNameEn: formData.companyNameEn.trim(),
      };

      if (formData.companyNameTh.trim())
        createData.companyNameTh = formData.companyNameTh.trim();
      if (formData.primaryRegistrationNo.trim())
        createData.primaryRegistrationNo =
          formData.primaryRegistrationNo.trim();
      if (formData.businessDescription.trim())
        createData.businessDescription = formData.businessDescription.trim();
      if (formData.addressLine1.trim())
        createData.addressLine1 = formData.addressLine1.trim();
      if (formData.addressLine2.trim())
        createData.addressLine2 = formData.addressLine2.trim();
      if (formData.postalCode.trim())
        createData.postalCode = formData.postalCode.trim();
      if (formData.primaryIndustryId.trim())
        createData.primaryIndustryId = formData.primaryIndustryId.trim();
      if (formData.primaryRegionId.trim())
        createData.primaryRegionId = formData.primaryRegionId.trim();
      if (formData.websiteUrl.trim())
        createData.websiteUrl = formData.websiteUrl.trim();
      if (formData.primaryEmail.trim())
        createData.primaryEmail = formData.primaryEmail.trim();
      if (formData.primaryPhone.trim())
        createData.primaryPhone = formData.primaryPhone.trim();
      if (formData.companySize) createData.companySize = formData.companySize;
      if (formData.employeeCountEstimate)
        createData.employeeCountEstimate = formData.employeeCountEstimate;
      if (formData.dataSensitivity)
        createData.dataSensitivity = formData.dataSensitivity;

      const newCompany = await apiClient.createCompany(createData);

      if (newCompany) {
        setSuccess(true);
        // Wait a moment to show success message
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(newCompany as Company);
          }
          handleOpenChange(false);
        }, 1000);
      } else {
        throw new Error("Failed to create company");
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      setError(error.message || "Failed to create company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    clearError(field);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Add a new company to your organization&apos;s database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyNameEn" className="text-sm font-medium">
                  Company Name (EN) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyNameEn"
                  value={formData.companyNameEn}
                  onChange={(e) => updateField("companyNameEn", e.target.value)}
                  placeholder="Acme Corporation"
                  disabled={isLoading}
                  className={hasError("companyNameEn") ? "border-red-500" : ""}
                />
                {hasError("companyNameEn") && (
                  <p className="text-sm text-red-500">
                    {getError("companyNameEn")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNameTh" className="text-sm font-medium">
                  Company Name (TH)
                </Label>
                <Input
                  id="companyNameTh"
                  value={formData.companyNameTh}
                  onChange={(e) => updateField("companyNameTh", e.target.value)}
                  placeholder="บริษัท อัคมี"
                  disabled={isLoading}
                  className={hasError("companyNameTh") ? "border-red-500" : ""}
                />
                {hasError("companyNameTh") && (
                  <p className="text-sm text-red-500">
                    {getError("companyNameTh")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="primaryRegistrationNo"
                className="text-sm font-medium"
              >
                Registration Number
              </Label>
              <Input
                id="primaryRegistrationNo"
                value={formData.primaryRegistrationNo}
                onChange={(e) =>
                  updateField("primaryRegistrationNo", e.target.value)
                }
                placeholder="0105562174634"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="businessDescription"
                className="text-sm font-medium"
              >
                Business Description
              </Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) =>
                  updateField("businessDescription", e.target.value)
                }
                placeholder="Brief description of the company's business..."
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">
              Contact Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryEmail" className="text-sm font-medium">
                  Primary Email
                </Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => updateField("primaryEmail", e.target.value)}
                  placeholder="contact@example.com"
                  disabled={isLoading}
                  className={hasError("primaryEmail") ? "border-red-500" : ""}
                />
                {hasError("primaryEmail") && (
                  <p className="text-sm text-red-500">
                    {getError("primaryEmail")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryPhone" className="text-sm font-medium">
                  Primary Phone
                </Label>
                <Input
                  id="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => updateField("primaryPhone", e.target.value)}
                  placeholder="+66 2 123 4567"
                  disabled={isLoading}
                  className={hasError("primaryPhone") ? "border-red-500" : ""}
                />
                {hasError("primaryPhone") && (
                  <p className="text-sm text-red-500">
                    {getError("primaryPhone")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-sm font-medium">
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
                className={hasError("websiteUrl") ? "border-red-500" : ""}
              />
              {hasError("websiteUrl") && (
                <p className="text-sm text-red-500">{getError("websiteUrl")}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">
              Address Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-sm font-medium">
                Address Line 1
              </Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                placeholder="123 Sukhumvit Road"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-sm font-medium">
                Address Line 2
              </Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => updateField("addressLine2", e.target.value)}
                placeholder="Floor 15, Tower A"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label
                  htmlFor="primaryRegionId"
                  className="text-sm font-medium"
                >
                  Region
                </Label>
                <Select
                  value={formData.primaryRegionId}
                  onValueChange={(value) =>
                    updateField("primaryRegionId", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.nameEn} {region.nameTh && `(${region.nameTh})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="10110"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">
              Company Details
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 min-w-0">
                <Label
                  htmlFor="primaryIndustryId"
                  className="text-sm font-medium"
                >
                  Industry
                </Label>
                <Combobox
                  options={industries.map((industry: any) => ({
                    value: industry.id,
                    label: industry.nameEn,
                  }))}
                  value={formData.primaryIndustryId}
                  onValueChange={(value) =>
                    updateField("primaryIndustryId", value)
                  }
                  placeholder="Select industry..."
                  searchPlaceholder="Search industries..."
                  emptyText="No industry found."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => updateField("companySize", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="employeeCountEstimate">
                  Employee Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeCountEstimate"
                  type="number"
                  value={formData.employeeCountEstimate || ""}
                  onChange={(e) =>
                    updateField(
                      "employeeCountEstimate",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="dataSensitivity"
                  className="text-sm font-medium"
                >
                  Data Sensitivity
                </Label>
                <Select
                  value={formData.dataSensitivity}
                  onValueChange={(value) =>
                    updateField("dataSensitivity", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
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
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success}>
            {isLoading
              ? "Creating..."
              : success
                ? "Created!"
                : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
