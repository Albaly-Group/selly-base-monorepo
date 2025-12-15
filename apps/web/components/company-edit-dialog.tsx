"use client";

import { useState, useEffect } from "react";
import type { Company, ContactPerson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from 'next-intl'
import { apiClient } from "@/lib/api-client";
import { useAuth, canEditSharedData } from "@/lib/auth";
import { Textarea } from "./ui/textarea";

interface ExtendedCompany extends Company {
  postalCode?: string | null;
  primaryRegionId?: string | null;
  primaryIndustryId?: string | null;
}

interface CompanyEditDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (company: Company) => void;
}

export function CompanyEditDialog({ company, open, onOpenChange, onSave }: CompanyEditDialogProps) {
  console.log(company)
  const t = useTranslations('company_detail')
  const tCommon = useTranslations('common')
  const tFields = useTranslations('companies_lookup.createCompany.fields')
  const tSizes = useTranslations('companies_lookup.createCompany.companySizes')
  const tSensitivity = useTranslations('companies_lookup.createCompany.dataSensitivity')
  const tReg = useTranslations('companies_lookup.createCompany.registration')
  const tRegStatus = useTranslations('companies_lookup.createCompany.registrationStatus')
  
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<ExtendedCompany>>({})
  const [industries, setIndustries] = useState<Array<{ id: string; titleEn: string; titleTh: string | null }>>([])
  const [regions, setRegions] = useState<Array<{ id: string; nameEn: string; nameTh: string | null }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("basic");
  const [registrationData, setRegistrationData] = useState({
    id: "",
    registrationNo: "",
    status: "active",
    authorityId: "",
    registrationTypeId: "",
    isPrimary: true,
    remarks: "",
    countryCode: "TH",
  });
  const [registrationAuthorities, setRegistrationAuthorities] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [registrationTypes, setRegistrationTypes] = useState<Array<{ id: string; key: string; name: string }>>([]);
  
  // Check if user can edit this company
  const canEdit = company?.isSharedData ? (user ? canEditSharedData(user) : false) : true
  const isOwner = user?.organization_id && company?.organization_id === user.organization_id
  // Verification status rules:
  // - For non-shared data (isSharedData = false): always allow editing
  // - For shared data (isSharedData = true): only platform admins can edit
  const canSetVerificationStatus = !company?.isSharedData || (user && canEditSharedData(user))

  useEffect(() => {
    console.log("Company prop changed:", company);
    if (company) {
      setFormData({ ...company });
      setError(null);
      setSuccess(false);
    }
  }, [company]);

  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      const loadReferenceData = async () => {
        try {
          const [industriesData, regionsData, authoritiesData, typesData] = await Promise.all([
            apiClient.getIndustries({ active: true }),
            apiClient.getRegionsHierarchical({ active: true, countryCode: 'TH' }),
            apiClient.getRegistrationAuthorities({ active: true }),
            apiClient.getRegistrationTypes(),
          ])

          const cleanIndustries = (industriesData.data || []).filter(
            (it: any) => typeof it.nameEn === 'string' && it.nameEn.trim() !== ''
          )
          
          setIndustries(cleanIndustries)
          setRegions(regionsData.data || [])
          setRegistrationAuthorities(authoritiesData.data || [])
          setRegistrationTypes(typesData.data || [])
        } catch (err) {
          console.error('Failed to load reference data:', err)
        }
      }
      loadReferenceData()
      // load existing registrations for this company
      if (company?.id) {
        (async () => {
          try {
            const regs = await apiClient.getCompanyRegistrations(company.id);
            if (Array.isArray(regs) && regs.length > 0) {
              const r = regs[0];
              setRegistrationData({
                id: r.id,
                registrationNo: r.registrationNo || "",
                status: r.status || "active",
                  authorityId: r.authorityId || r.authorityCode || "",
                  registrationTypeId: r.registrationTypeId || r.registrationType || "",
                isPrimary: !!r.isPrimary,
                remarks: (r.rawData && (r.rawData as any).remarks) || "",
                countryCode: r.countryCode || "TH",
              });
            }
          } catch (err) {
            console.error('Failed to load company registrations:', err);
          }
        })();
      }
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.id) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

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
      if (formData.postalCode !== undefined) updateData.postalCode = formData.postalCode
      if (formData.primaryIndustryId !== undefined) updateData.primaryIndustryId = formData.primaryIndustryId
      if (formData.primaryRegionId !== undefined) updateData.primaryRegionId = formData.primaryRegionId
      if (formData.websiteUrl !== undefined) updateData.websiteUrl = formData.websiteUrl
      if (formData.primaryEmail !== undefined) updateData.primaryEmail = formData.primaryEmail
      if (formData.primaryPhone !== undefined) updateData.primaryPhone = formData.primaryPhone
      if (formData.companySize !== undefined) updateData.companySize = formData.companySize
      if (formData.employeeCountEstimate !== undefined && formData.employeeCountEstimate !== null && formData.employeeCountEstimate > 0) updateData.employeeCountEstimate = formData.employeeCountEstimate
      if (formData.tags !== undefined) updateData.tags = formData.tags
      if (formData.dataSensitivity !== undefined) updateData.dataSensitivity = formData.dataSensitivity
      
      // Allow organization owners and platform admins (on shared data) to update verification status
      if (canSetVerificationStatus && formData.verificationStatus !== undefined) {
        updateData.verificationStatus = formData.verificationStatus
      }

      const updatedCompany = await apiClient.updateCompany(formData.id, updateData)
      
      if (updatedCompany) {
        // Try create/update registration (non-blocking)
        if (registrationData.registrationNo && registrationData.authorityId && registrationData.registrationTypeId) {
          try {
            if (registrationData.id) {
              await apiClient.updateCompanyRegistration(registrationData.id, {
                registrationNo: registrationData.registrationNo,
                registrationTypeId: registrationData.registrationTypeId,
                authorityId: registrationData.authorityId,
                countryCode: registrationData.countryCode,
                status: registrationData.status,
                isPrimary: registrationData.isPrimary,
                remarks: registrationData.remarks,
              });
            } else {
              await apiClient.createCompanyRegistration({
                companyId: formData.id,
                registrationNo: registrationData.registrationNo,
                registrationTypeId: registrationData.registrationTypeId,
                authorityId: registrationData.authorityId,
                countryCode: registrationData.countryCode,
                status: registrationData.status,
                isPrimary: registrationData.isPrimary,
                remarks: registrationData.remarks,
              });
            }
          } catch (regError) {
            console.error('Failed to create/update registration:', regError);
          }
        }

        setSuccess(true);
        setTimeout(() => {
          onSave(updatedCompany as Company);
          onOpenChange(false);
        }, 1000);
      } else {
        throw new Error("Failed to update company");
      }
    } catch (error: any) {
      console.error("Error updating company:", error);
      setError(error.message || "Failed to update company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof ExtendedCompany, value: any) => {
    setFormData((prev: Partial<ExtendedCompany>) => ({ ...prev, [field]: value }))
  }

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>

        {company?.isSharedData && !canEdit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">{t('shared.cannotEdit')}</p>
              <p className="text-red-700 mt-1">{t('shared.cannotEditDescription')}</p>
            </div>
          </div>
        )}
        
        {company?.isSharedData && canEdit && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">{t('shared.editing')}</p>
              <p className="text-blue-700 mt-1">{t('shared.editingDescription')}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-2 text-sm">
              <TabsTrigger value="basic" className="px-2">{t('companyInfo.title')}</TabsTrigger>
              <TabsTrigger value="registration" className="px-2">{t('edit.registrationTab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <h3 className="text-lg font-medium">{t('companyInfo.title')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{tFields('companyNameEn')}</Label>
                  <Input
                    id="companyName"
                    value={formData.companyNameEn || ""}
                    onChange={(e) => updateField("companyNameEn", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNameTh">{tFields('companyNameTh')}</Label>
                  <Input
                    id="companyNameTh"
                    value={formData.companyNameTh || ""}
                    onChange={(e) => updateField("companyNameTh", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1">
                <Label htmlFor="businessDescription">{tFields('businessDescription')}</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription || ""}
                  onChange={(e) => updateField("businessDescription", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('contactInfo.title')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">{tFields('email')}</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={formData.primaryEmail || ""}
                      onChange={(e) => updateField("primaryEmail", e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">{tFields('phone')}</Label>
                    <Input
                      id="primaryPhone"
                      value={formData.primaryPhone || ""}
                      onChange={(e) => updateField("primaryPhone", e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">{tFields('websiteUrl')}</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl || ""}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('contactInfo.address') || 'Address Information'}</h3>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">{tFields('addressLine1')}</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1 ?? (formData as any).address1 ?? ""}
                    onChange={(e) => updateField("addressLine1", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">{tFields('addressLine2')}</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2 ?? (formData as any).address2 ?? ""}
                    onChange={(e) => updateField("addressLine2", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="primaryRegionId">Region</Label>
                    <Select
                      value={formData.primaryRegionId || ""}
                      onValueChange={(value) => updateField("primaryRegionId", value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('contactInfo.province') || 'Select region...'} />
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
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ""}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="10110"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('companyInfo.title')}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="primaryIndustryId">Industry</Label>
                    <Combobox
                      options={industries.map((industry: any) => ({ value: industry.id, label: industry.nameEn }))}
                      value={formData.primaryIndustryId || ""}
                      onValueChange={(value) => updateField("primaryIndustryId", value)}
                      placeholder={t('companyInfo.industry') || 'Select industry...'}
                        searchPlaceholder={t('filters.industryPlaceholder') || 'Search industries...'}
                        emptyText={t('filters.noIndustry') || 'No industry found.'}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={formData.companySize || ""}
                      onValueChange={(value) => updateField("companySize", value)}
                      disabled={!canEdit}
                    >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('filters.anySize') || 'Select size...'} />
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
                    <Label htmlFor="employeeCountEstimate">Employee Count</Label>
                    <Input
                      id="employeeCountEstimate"
                      type="number"
                      value={formData.employeeCountEstimate || ""}
                      onChange={(e) => updateField("employeeCountEstimate", parseInt(e.target.value) || undefined)}
                      placeholder="50"
                      disabled={!canEdit}
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
                      <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('companies_lookup.createCompany.dataSensitivity.placeholder') || 'Select sensitivity...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {canSetVerificationStatus && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Verification</h3>
                    <div className="space-y-2">
                      <Label htmlFor="verificationStatus">Verification Status</Label>
                      <Select
                        value={formData.verificationStatus || ""}
                        onValueChange={(value) => updateField("verificationStatus", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('companyInfo.verificationStatus') || 'Status'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">{t('verification.verified')}</SelectItem>
                          <SelectItem value="unverified">{t('verification.unverified')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {isOwner
                          ? t('messages.ownerCanSetVerification') || "As the data owner, you can set the verification status for this company."
                          : t('messages.adminCanSetVerification') || "As a platform admin, you can set the verification status for this shared data."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="registration" className="space-y-4">
              <h3 className="text-lg font-medium">Registration #1</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNo" className="text-sm font-medium">{tReg('registrationNo')}</Label>
                  <Input
                    id="registrationNo"
                    value={registrationData.registrationNo}
                    onChange={(e) => setRegistrationData((p) => ({ ...p, registrationNo: e.target.value }))}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationStatus" className="text-sm font-medium">{tReg('status')}</Label>
                  <Select
                    value={registrationData.status}
                    onValueChange={(value) => setRegistrationData((p) => ({ ...p, status: value }))}
                    disabled={!canEdit}
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
                  <Label htmlFor="authorityCode" className="text-sm font-medium">{tReg('authority')}</Label>
                  <Select
                    value={registrationData.authorityId}
                    onValueChange={(value) => setRegistrationData((p) => ({ ...p, authorityId: value }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Registration Authorities" />
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
                  <Label htmlFor="registrationType" className="text-sm font-medium">{tReg('type')}</Label>
                  <Select
                    value={registrationData.registrationTypeId}
                    onValueChange={(value) => setRegistrationData((p) => ({ ...p, registrationTypeId: value }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Registration Type" />
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={registrationData.isPrimary}
                  onChange={(e) => setRegistrationData((p) => ({ ...p, isPrimary: e.target.checked }))}
                  disabled={!canEdit}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPrimary" className="text-sm font-medium cursor-pointer">Primary Registration</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium">Remarks</Label>
                <Input
                  id="remarks"
                  value={registrationData.remarks}
                  onChange={(e) => setRegistrationData((p) => ({ ...p, remarks: e.target.value }))}
                  disabled={!canEdit}
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
            <span className="text-sm">{t('edit.success')}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {!canEdit ? tCommon('cancel') : tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success || !canEdit}>
            {isLoading ? tCommon('loading') : success ? t('edit.saved') : tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
