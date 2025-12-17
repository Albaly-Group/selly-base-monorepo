"use client";

import { useState, useEffect } from "react";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  
  const [registrationData, setRegistrationData] = useState({
    registrationNo: "",
    status: "active",
    authorityId: "",
    registrationTypeId: "",
    isPrimary: true,
    remarks: "",
    countryCode: "TH",
  });
  const [registrationAuthorities, setRegistrationAuthorities] = useState<Array<{ id: string; code: string; name: string; countryCode?: string }>>([]);
  const [registrationTypes, setRegistrationTypes] = useState<Array<{ id: string; key: string; name: string }>>([]);

  const [industries, setIndustries] = useState<
    Array<{ id: string; titleEn: string; titleTh: string | null }>
  >([]);
  const [regions, setRegions] = useState<
    Array<{ id: string; nameEn: string; nameTh: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations('companies_lookup.createCompany');
  const tFields = useTranslations('companies_lookup.createCompany.fields');
  const tSizes = useTranslations('companies_lookup.createCompany.companySizes');
  const tSensitivity = useTranslations('companies_lookup.createCompany.dataSensitivity');
  const tReg = useTranslations('companies_lookup.createCompany.registration');
  const tRegStatus = useTranslations('companies_lookup.createCompany.registrationStatus');
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
    setRegistrationData({
      registrationNo: "",
      status: "active",
      authorityId: "",
      registrationTypeId: "",
      isPrimary: true,
      remarks: "",
      countryCode: "TH",
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
          const [industriesData, regionsData, authoritiesData, typesData] = await Promise.all([
            apiClient.getIndustries({ active: true }),
            apiClient.getRegionsHierarchical({
              active: true,
              countryCode: "TH",
            }),
            apiClient.getRegistrationAuthorities({ active: true }),
            apiClient.getRegistrationTypes(),
          ]);
          const cleanIndustries = (industriesData.data || []).filter(
            (it: any) =>
              typeof it.nameEn === "string" && it.nameEn.trim() !== ""
          );

          setIndustries(cleanIndustries);
          setRegions(regionsData.data || []);
          setRegistrationAuthorities(authoritiesData.data || []);
          setRegistrationTypes(typesData.data || []);
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
      setError(t('error'));
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
        // Create company registration if registration data is provided
        if (
          registrationData.registrationNo &&
          registrationData.authorityId &&
          registrationData.registrationTypeId
        ) {
          try {
            await apiClient.createCompanyRegistration({
              companyId: newCompany.id,
              registrationNo: registrationData.registrationNo,
              registrationTypeId: registrationData.registrationTypeId,
              authorityId: registrationData.authorityId,
              countryCode: registrationData.countryCode,
              status: registrationData.status,
              isPrimary: registrationData.isPrimary,
              remarks: registrationData.remarks,
            });
            console.log("Company registration created successfully");
          } catch (regError: any) {
            console.error("Failed to create registration:", regError);
            // Don't fail the whole operation if registration fails
            // Company is already created
          }
        }

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
      setError(error.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    clearError(field);
  };

  const updateRegistrationField = (field: string, value: string | boolean) => {
    setRegistrationData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-2 text-sm">
              <TabsTrigger value="basic" className="px-2">
                {t('tabs.basic')}
              </TabsTrigger>
              <TabsTrigger value="registration" className="px-2">
                {t('tabs.registration')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <h3 className="text-base font-medium text-gray-900">
                {t('tabs.basic')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyNameEn" className="text-sm font-medium">
                    {tFields('companyNameEn')}
                  </Label>
                  <Input
                    id="companyNameEn"
                    value={formData.companyNameEn}
                    onChange={(e) => updateField("companyNameEn", e.target.value)}
                    placeholder={tFields('companyNameEnPlaceholder')}
                    disabled={isLoading}
                    className={hasError("companyNameEn") ? "border-red-500" : ""}
                  />
                  {hasError("companyNameEn") && (
                    <p className="text-sm text-red-500">{getError("companyNameEn")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyNameTh" className="text-sm font-medium">
                    {tFields('companyNameTh')}
                  </Label>
                  <Input
                    id="companyNameTh"
                    value={formData.companyNameTh}
                    onChange={(e) => updateField("companyNameTh", e.target.value)}
                    placeholder={tFields('companyNameThPlaceholder')}
                    disabled={isLoading}
                    className={hasError("companyNameTh") ? "border-red-500" : ""}
                  />
                  {hasError("companyNameTh") && (
                    <p className="text-sm text-red-500">{getError("companyNameTh")}</p>
                  )}
                </div>
              </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-sm font-medium">
                    {tFields('businessDescription')}
                  </Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => updateField("businessDescription", e.target.value)}
                    placeholder={tFields('businessDescriptionPlaceholder')}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                {/* Contact Information (moved into Basic tab) */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900">{t('tabs.contact')}</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryEmail" className="text-sm font-medium">{tFields('email')}</Label>
                      <Input
                        id="primaryEmail"
                        type="email"
                        value={formData.primaryEmail}
                        onChange={(e) => updateField("primaryEmail", e.target.value)}
                        placeholder={tFields('emailPlaceholder')}
                        disabled={isLoading}
                        className={hasError("primaryEmail") ? "border-red-500" : ""}
                      />
                      {hasError("primaryEmail") && (
                        <p className="text-sm text-red-500">{getError("primaryEmail")}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone" className="text-sm font-medium">{tFields('phone')}</Label>
                      <Input
                        id="primaryPhone"
                        type="tel"
                        value={formData.primaryPhone}
                        onChange={(e) => updateField("primaryPhone", e.target.value)}
                        placeholder={tFields('phonePlaceholder')}
                        disabled={isLoading}
                        className={hasError("primaryPhone") ? "border-red-500" : ""}
                      />
                      {hasError("primaryPhone") && (
                        <p className="text-sm text-red-500">{getError("primaryPhone")}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-sm font-medium">{tFields('websiteUrl')}</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => updateField("websiteUrl", e.target.value)}
                      placeholder={tFields('websiteUrlPlaceholder')}
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
              {tFields('addressLine1')}
            </h3>

            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-sm font-medium">
                {tFields('addressLine1')}
              </Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                placeholder={tFields('addressLine1Placeholder')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-sm font-medium">
                {tFields('addressLine2')}
              </Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => updateField("addressLine2", e.target.value)}
                placeholder={tFields('addressLine2Placeholder')}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label
                  htmlFor="primaryRegionId"
                  className="text-sm font-medium"
                >
                  {tFields('region')}
                </Label>
                <Select
                  value={formData.primaryRegionId}
                  onValueChange={(value) =>
                    updateField("primaryRegionId", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tFields('regionPlaceholder')} />
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
                  {tFields('postalCode')}
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder={tFields('postalCodePlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900">
              {t('tabs.basic')}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 min-w-0">
                <Label
                  htmlFor="primaryIndustryId"
                  className="text-sm font-medium"
                >
                  {tFields('industry')}
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
                  placeholder={tFields('industryPlaceholder')}
                  searchPlaceholder={tFields('industryPlaceholder')}
                  emptyText="-"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">{tFields('companySize')}</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => updateField("companySize", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tFields('companySize')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">{tSizes('micro')}</SelectItem>
                    <SelectItem value="small">{tSizes('small')}</SelectItem>
                    <SelectItem value="medium">{tSizes('medium')}</SelectItem>
                    <SelectItem value="large">{tSizes('large')}</SelectItem>
                    <SelectItem value="enterprise">{tSizes('enterprise')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCountEstimate">
                  {tFields('employeeCount')}
                </Label>
                <Input
                  id="employeeCountEstimate"
                  type="number"
                  value={formData.employeeCountEstimate || ""}
                  onChange={(e) =>
                    updateField(
                      "employeeCountEstimate",
                      parseInt(e.target.value).toString(),
                    )
                  }
                  placeholder={tFields('employeeCountPlaceholder')}
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
                  {tFields('dataSensitivity')}
                </Label>
                <Select
                  value={formData.dataSensitivity}
                  onValueChange={(value) =>
                    updateField("dataSensitivity", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tFields('dataSensitivity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{tSensitivity('public')}</SelectItem>
                    <SelectItem value="standard">{tSensitivity('standard')}</SelectItem>
                    <SelectItem value="confidential">{tSensitivity('confidential')}</SelectItem>
                    <SelectItem value="restricted">{tSensitivity('restricted')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
              </TabsContent>

            <TabsContent value="registration" className="space-y-4">
              <h3 className="text-base font-medium text-gray-900">{t('tabs.registration')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNo" className="text-sm font-medium">
                    {tReg('registrationNo')}
                  </Label>
                  <Input
                    id="registrationNo"
                    value={registrationData.registrationNo}
                    onChange={(e) => updateRegistrationField("registrationNo", e.target.value)}
                    placeholder={tReg('registrationNoPlaceholder')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationStatus" className="text-sm font-medium">
                    {tReg('status')}
                  </Label>
                  <Select
                    value={registrationData.status}
                    onValueChange={(value) => updateRegistrationField("status", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tReg('status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{tRegStatus('active')}</SelectItem>
                      <SelectItem value="inactive">{tRegStatus('inactive')}</SelectItem>
                      <SelectItem value="dissolved">{tRegStatus('dissolved')}</SelectItem>
                      <SelectItem value="suspended">{tRegStatus('suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authorityCode" className="text-sm font-medium">
                    {tReg('authority')}
                  </Label>
                    <Select
                      value={registrationData.authorityId}
                      onValueChange={(value) => updateRegistrationField("authorityId", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tReg('authorityPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {registrationAuthorities.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationType" className="text-sm font-medium">
                    {tReg('type')}
                  </Label>
                    <Select
                      value={registrationData.registrationTypeId}
                      onValueChange={(value) => updateRegistrationField("registrationTypeId", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={tReg('typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {registrationTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
              </div>
              {/* <div className="space-y-2">
                  <Label htmlFor="countryCode" className="text-sm font-medium">
                    Country
                  </Label>
                  <Select
                    value={registrationData.countryCode}
                    onValueChange={(value) => updateRegistrationField("countryCode", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Registration Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JURISTIC">Juristic Person</SelectItem>
                      <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                      <SelectItem value="LIMITED">Limited Company</SelectItem>
                      <SelectItem value="PUBLIC">Public Company</SelectItem>
                      <SelectItem value="BRANCH">Branch Office</SelectItem>
                      <SelectItem value="REPRESENTATIVE">Representative Office</SelectItem>
                    </SelectContent>
                  </Select>
              </div> */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={registrationData.isPrimary}
                  onChange={(e) => updateRegistrationField("isPrimary", e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPrimary" className="text-sm font-medium cursor-pointer">
                  {tReg('isPrimary')}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium">
                  {tReg('remarks')}
                </Label>
                <Textarea
                  id="remarks"
                  value={registrationData.remarks}
                  onChange={(e) => updateRegistrationField("remarks", e.target.value)}
                  placeholder={tReg('remarksPlaceholder')}
                  disabled={isLoading}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
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
            <span className="text-sm">{t('success')}</span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success}>
            {isLoading
              ? t('creating')
              : success
                ? t('success')
                : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
