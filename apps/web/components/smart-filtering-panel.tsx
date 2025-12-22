"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, Target, Save, Plus, Trash2 } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api-client"
import { ProvincePickerTrigger, ProvincePickerModal, type ProvinceOption } from "@/components/ui/province-picker-modal"
import { IndustryPickerModal, IndustryPickerTrigger, type IndustryOption } from "@/components/ui/industry-picker-modal"

export interface SmartFilteringCriteria {
  keyword?: string
  keywordWeight?: number
  industrial?: string
  industrialWeight?: number
  province?: string
  provinceWeight?: number
  companySize?: string
  companySizeWeight?: number
  verificationStatus?: string
  verificationStatusWeight?: number
  minimumScore?: number
  profileName?: string
}

interface SmartFilteringPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  criteria: SmartFilteringCriteria
  onApplyFiltering: (criteria: SmartFilteringCriteria) => void
  onClearFiltering: () => void
  triggerType?: "button" | "search"
  initialKeyword?: string
}


const fallbackCompanySizeOptions = [
  { value: "small", label: "Small (S)" },
  { value: "medium", label: "Medium (M)" },
  { value: "large", label: "Large (L)" },
]

const fallbackContactStatusOptions = [
  { value: 'verified', label: 'Verified' },
  { value: 'need_verified', label: 'Need Verified' },
  { value: 'unverified', label: 'Unverified' }
]

export function SmartFilteringPanel({
  isOpen,
  onOpenChange,
  criteria,
  onApplyFiltering,
  onClearFiltering,
  initialKeyword = "",
}: SmartFilteringPanelProps) {
  const t = useTranslations('companies_lookup')
  const tCommon = useTranslations('common')
  const [tempCriteria, setTempCriteria] = useState<SmartFilteringCriteria>({
    ...criteria,
    keyword: initialKeyword || criteria.keyword || "",
    keywordWeight: criteria.keywordWeight || 25,
    industrialWeight: criteria.industrialWeight || 25,
    provinceWeight: criteria.provinceWeight || 20,
    companySizeWeight: criteria.companySizeWeight || 15,
    verificationStatusWeight: criteria.verificationStatusWeight || 15,
    minimumScore: criteria.minimumScore || 0,
  })

  // State for Picker components - store full objects
  const [industryPickerOptions, setIndustryPickerOptions] = useState<IndustryOption[]>([])
  const [provincePickerOptions, setProvincePickerOptions] = useState<ProvinceOption[]>([])
  const [companySizeOptions, setCompanySizeOptions] = useState<any[]>(fallbackCompanySizeOptions)
  const [contactStatusOptions, setContactStatusOptions] = useState<{value: string, label: string}[]>(fallbackContactStatusOptions)

  // Modal state
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false)
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false)
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false)
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)

  useEffect(() => {
    const fetchReferenceData = async () => {
      // try {
      //   // Fetch industries
      //   const industriesResponse = await apiClient.getIndustries()
      //   const list = industriesResponse.data || []

      //   if (industriesResponse.data && industriesResponse.data.length > 0) {
      //     const options = list
      //       .filter(it => typeof it.nameEn === 'string' && it.nameEn.trim() !== '')
      //       .map(it => ({
      //         value: String(it.id), 
      //         label: it.nameEn!.trim(), 
      //       }));

      //     setIndustrialOptions(options);
      //   }
      // } catch (error) {
      //   console.error('Failed to fetch industries, using fallback:', error)
      // }
      try {
        // Fetch Used Industries
        setIsLoadingIndustries(true)
        const industriesResponse = await apiClient.getUsedIndustries()
        const list = industriesResponse.data || []

        if (industriesResponse.data && industriesResponse.data.length > 0) {
          const options: IndustryOption[] = list
            .filter((it: any) => typeof it.nameEn === 'string' && it.nameEn.trim() !== '')
            .map((it: any) => ({
              id: String(it.id),
              code: it.code || '',
              titleEn: it.nameEn!.trim(),
              titleTh: it.nameTh || null,
              description: it.description || null,
            }));

          setIndustryPickerOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch industries, using fallback:', error)
      } finally {
        setIsLoadingIndustries(false)
      }

      // try {
      //   // Fetch provinces
      //   const provincesResponse = await apiClient.getProvinces()
      //   if (provincesResponse.data && provincesResponse.data.length > 0) {
      //     setProvinceOptions(provincesResponse.data.map((item: any) => item.name || item.nameEn))
      //   }
      // } catch (error) {
      //   console.error('Failed to fetch provinces, using fallback:', error)
      // }
      try {
        // Fetch Used provinces
        setIsLoadingProvinces(true)
        const provincesResponse = await apiClient.getUsedProvinces()
        if (provincesResponse.data && provincesResponse.data.length > 0) {
          const options: ProvinceOption[] = provincesResponse.data.map((item: any) => ({
            id: String(item.id),
            code: item.code || '',
            nameEn: item.nameEn || item.name || '',
            nameTh: item.nameTh || null,
            regionType: item.regionType || undefined,
          }));
          setProvincePickerOptions(options);
        }
      } catch (error) {
        console.error('Failed to fetch provinces, using fallback:', error)
      } finally {
        setIsLoadingProvinces(false)
      }

      try {
        // Fetch company sizes
        const sizesResponse = await apiClient.getCompanySizes()
        if (sizesResponse.data && sizesResponse.data.length > 0) {
          setCompanySizeOptions(
            sizesResponse.data.map((item: any) => ({
              value: item.value,
              label: item.displayName || item.label,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch company sizes, using fallback:', error)
      }

      try {
        // Fetch contact statuses
        const statusesResponse = await apiClient.getContactStatuses()
        if (statusesResponse.data && statusesResponse.data.length > 0) {
          setContactStatusOptions(statusesResponse.data.map((item: any) => ({
            value: item.value, // Use value for API calls
            label: item.label  // Use label for display
          })))
        }
      } catch (error) {
        console.error('Failed to fetch contact statuses, using fallback:', error)
      }
    }

    if (isOpen) {
      fetchReferenceData()
    }
  }, [isOpen])

  const updateCriteria = (key: keyof SmartFilteringCriteria, value: any) => {
    console.log("Value", value);
    const normalizedValue = value === "" ? undefined : value;
    
    setTempCriteria((prev) => ({
      ...prev,
      [key]: normalizedValue,
    }))
  }

  // Adapter: Convert ID to name for Industry (maintains existing payload)
  const handleIndustryChange = (industryId: string | null) => {
    if (!industryId) {
      updateCriteria("industrial", undefined)
      return
    }
    const industry = industryPickerOptions.find(opt => opt.id === industryId)
    if (industry) {
      updateCriteria("industrial", industry.titleEn)
    }
  }

  // Adapter: Convert ID to name for Province (maintains existing payload)
  const handleProvinceChange = (provinceId: string | null) => {
    if (!provinceId) {
      updateCriteria("province", undefined)
      return
    }
    const province = provincePickerOptions.find(opt => opt.id === provinceId)
    if (province) {
      updateCriteria("province", province.nameEn)
    }
  }

  // Compute selected IDs from stored names
  const selectedIndustryId = useMemo(() => {
    if (!tempCriteria.industrial) return null
    const industry = industryPickerOptions.find(opt => opt.titleEn === tempCriteria.industrial)
    return industry?.id || null
  }, [tempCriteria.industrial, industryPickerOptions])

  const selectedProvinceId = useMemo(() => {
    if (!tempCriteria.province) return null
    const province = provincePickerOptions.find(opt => opt.nameEn === tempCriteria.province)
    return province?.id || null
  }, [tempCriteria.province, provincePickerOptions])

  const handleApply = () => {
    onApplyFiltering(tempCriteria)
    onOpenChange(false)
  }

  const handleClear = () => {
    setTempCriteria({
      keywordWeight: 25,
      industrialWeight: 25,
      provinceWeight: 20,
      companySizeWeight: 15,
      verificationStatusWeight: 15,
      minimumScore: 0,
    })
    onClearFiltering()
  }

  // Calculate total weight only for active filters
  const totalWeight = 
    (tempCriteria.keyword && tempCriteria.keyword.trim() ? (tempCriteria.keywordWeight || 0) : 0) + 
    (tempCriteria.industrial ? (tempCriteria.industrialWeight || 0) : 0) + 
    (tempCriteria.province ? (tempCriteria.provinceWeight || 0) : 0) + 
    (tempCriteria.companySize ? (tempCriteria.companySizeWeight || 0) : 0) + 
    (tempCriteria.verificationStatus ? (tempCriteria.verificationStatusWeight || 0) : 0)

  const hasActiveCriteria = Object.values(tempCriteria).some((value, index) => {
    const keys = Object.keys(tempCriteria)
    const key = keys[index]
    
    if (key.includes('Weight') || key === 'minimumScore' || key === 'profileName') return false
    return value !== undefined && value !== ""
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('filters.smartFiltering')} &nbsp;{t('table.leadScore')}
            {hasActiveCriteria && (
              <Badge variant="default" className="ml-2">
                {t('smartFiltering.active') || 'Active'}
              </Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('filters.smartFilteringDescription')}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Keyword Search Section */}
          <Card>
              <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t('search.label')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Label className="mb-2" htmlFor="keyword">{t('filters.keyword')}</Label>
                <Input
                  id="keyword"
                  className="shadow-sm "
                  placeholder={t('search.placeholder')}
                  value={tempCriteria.keyword || ""}
                  onChange={(e) => updateCriteria("keyword", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('filters.keywordHelp') || 'Leave empty to filter by attributes only'}</p>
              </div>
              {tempCriteria.keyword && tempCriteria.keyword.trim() && (
                <div>
                  <Label>{t('smartFiltering.keywordWeightLabel') || 'Keyword Weight:'} {tempCriteria.keywordWeight}%</Label>
                  <Slider
                    value={[tempCriteria.keywordWeight ?? 25]}
                    onValueChange={(value) => updateCriteria("keywordWeight", value[0])}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attribute Filtering Section */}
          <Card>
                <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('filters.smartFiltering')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry */}
                <div className="space-y-3">
                  <Label>{t('filters.industry')}</Label>
                  <IndustryPickerTrigger
                    value={selectedIndustryId}
                    options={industryPickerOptions}
                    onClick={() => setIsIndustryModalOpen(true)}
                    placeholder={t('filters.industryPlaceholder') || "Select industry..."}
                  />
                  <IndustryPickerModal
                    open={isIndustryModalOpen}
                    onOpenChange={setIsIndustryModalOpen}
                    value={selectedIndustryId}
                    onValueChange={handleIndustryChange}
                    options={industryPickerOptions}
                    isLoading={isLoadingIndustries}
                  />

                  <div>
                    <Label className="text-sm">{t('smartFiltering.weightLabel') || 'Weight:'} {tempCriteria.industrialWeight}%</Label>
                    <Slider
                      value={[tempCriteria.industrialWeight ?? 25]}
                      onValueChange={(value) => updateCriteria("industrialWeight", value[0])}
                      max={50}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Province */}
                <div className="space-y-3">
                  <Label>{t('filters.province')}</Label>
                  <ProvincePickerTrigger
                    value={selectedProvinceId}
                    options={provincePickerOptions}
                    onClick={() => setIsProvinceModalOpen(true)}
                    placeholder={t('filters.provincePlaceholder') || "Select province..."}
                  />
                  <ProvincePickerModal
                    open={isProvinceModalOpen}
                    onOpenChange={setIsProvinceModalOpen}
                    value={selectedProvinceId}
                    onValueChange={handleProvinceChange}
                    options={provincePickerOptions}
                    isLoading={isLoadingProvinces}
                  />
                  <div>
                    <Label className="text-sm">{t('smartFiltering.weightLabel') || 'Weight:'} {tempCriteria.provinceWeight}%</Label>
                    <Slider
                      value={[tempCriteria.provinceWeight ?? 20]}
                      onValueChange={(value) => updateCriteria("provinceWeight", value[0])}
                      max={50}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div className="space-y-3">
                  <Label>{t('filters.size')}</Label>
                  <Select
                    value={tempCriteria.companySize || ""}
                    onValueChange={(value) => updateCriteria("companySize", value === "any" ? "" : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('filters.anySize') || 'Any Size'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('filters.anySize') || 'Any Size'}</SelectItem>
                      {companySizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">{t('smartFiltering.weightLabel') || 'Weight:'} {tempCriteria.companySizeWeight}%</Label>
                    <Slider
                      value={[tempCriteria.companySizeWeight ?? 15]}
                      onValueChange={(value) => updateCriteria("companySizeWeight", value[0])}
                      max={50}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Contact Status */}
                <div className="space-y-3">
                  <Label>{t('filters.status')}</Label>
                  <Select
                    value={tempCriteria.verificationStatus || ""}
                    onValueChange={(value) => updateCriteria("verificationStatus", value === "any" ? "" : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('filters.anyStatus') || 'Any Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('filters.anyStatus') || 'Any Status'}</SelectItem>
                      {contactStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">{t('smartFiltering.weightLabel') || 'Weight:'} {tempCriteria.verificationStatusWeight}%</Label>
                    <Slider
                      value={[tempCriteria.verificationStatusWeight ?? 15]}
                      onValueChange={(value) => updateCriteria("verificationStatusWeight", value[0])}
                      max={50}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Total Weight Display */}
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('smartFiltering.totalWeightTitle') || 'Total Active Weight'}</span>
                  <Badge variant={totalWeight === 100 ? "default" : "secondary"}>
                    {totalWeight}% 
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalWeight === 0 
                    ? (t('smartFiltering.totalWeightMessages.none') || "Select at least one filter above to enable weighted scoring")
                    : totalWeight !== 100 
                      ? (t('smartFiltering.totalWeightMessages.normalized') || "Weights don't need to total 100%. Results will be normalized.")
                      : (t('smartFiltering.totalWeightMessages.perfect') || "Perfect! Weights are balanced at 100%")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Minimum Score Threshold */}
          <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('smartFiltering.scoreThreshold') || 'Score Threshold'}</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  <Label>{t('smartFiltering.minimumWeightedScore') || 'Minimum Weighted Score:'} {tempCriteria.minimumScore}%</Label>
                <Slider
                  value={[tempCriteria.minimumScore ?? 0]}
                  onValueChange={(value) => updateCriteria("minimumScore", value[0])}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                  <p className="text-xs text-muted-foreground">
                    {t('smartFiltering.minimumScoreDescription') || 'Only show companies with a weighted score above this threshold'}
                  </p>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Profile */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="h-4 w-4" />
                Scoring Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Profile name (optional)"
                  value={tempCriteria.profileName || ""}
                  onChange={(e) => updateCriteria("profileName", e.target.value)}
                />
                <Button variant="outline" size="sm" disabled>
                  <Save className="h-4 w-4 mr-1" />
                  Save Profile
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this configuration as a reusable scoring profile (coming soon)
              </p>
            </CardContent>
          </Card> */}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {!hasActiveCriteria && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                {t('smartFiltering.helpSelectCriteria')}
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={handleApply} className="flex-1" disabled={!hasActiveCriteria}>
                {t('actions.applySmartFiltering') || 'Apply Smart Filtering'}
                {hasActiveCriteria && (
                  <Badge variant="secondary" className="ml-2 bg-white/20">
                    {Object.values(tempCriteria).filter((value, index) => {
                      const keys = Object.keys(tempCriteria)
                      const key = keys[index]
                      if (key.includes('Weight') || key === 'minimumScore' || key === 'profileName') return false
                      return value !== undefined && value !== ""
                    }).length}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                {t('actions.clearAll') || 'Clear All'}
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {tCommon('cancel') || 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}