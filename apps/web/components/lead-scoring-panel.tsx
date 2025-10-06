"use client"

import { useState, useEffect } from "react"
import type { FilterOptions } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, X, Zap } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface LeadScoringPanelProps {
  isActive: boolean
  criteria: FilterOptions
  onApplyScoring: (criteria: FilterOptions) => void
  onClearScoring: () => void
}

// Fallback options in case API fails
const fallbackIndustrialOptions = [
  "Manufacturing",
  "Logistics",
  "Automotive",
  "Tourism",
  "Agriculture",
  "Technology",
  "Healthcare",
]

const fallbackProvinceOptions = ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Chonburi", "Rayong", "Samut Prakan"]

const fallbackCompanySizeOptions = [
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
]

const fallbackContactStatusOptions = ["Active", "Needs Verification", "Invalid"]

export function LeadScoringPanel({ isActive, criteria, onApplyScoring, onClearScoring }: LeadScoringPanelProps) {
  const [tempCriteria, setTempCriteria] = useState<FilterOptions>(criteria)
  const [industrialOptions, setIndustrialOptions] = useState<string[]>(fallbackIndustrialOptions)
  const [provinceOptions, setProvinceOptions] = useState<string[]>(fallbackProvinceOptions)
  const [companySizeOptions, setCompanySizeOptions] = useState<any[]>(fallbackCompanySizeOptions)
  const [contactStatusOptions, setContactStatusOptions] = useState<string[]>(fallbackContactStatusOptions)

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch industries
        const industriesResponse = await apiClient.getIndustries()
        if (industriesResponse.data && industriesResponse.data.length > 0) {
          setIndustrialOptions(industriesResponse.data.map((item: any) => item.name || item.nameEn))
        }
      } catch (error) {
        console.error('Failed to fetch industries, using fallback:', error)
      }

      try {
        // Fetch provinces
        const provincesResponse = await apiClient.getProvinces()
        if (provincesResponse.data && provincesResponse.data.length > 0) {
          setProvinceOptions(provincesResponse.data.map((item: any) => item.name || item.nameEn))
        }
      } catch (error) {
        console.error('Failed to fetch provinces, using fallback:', error)
      }

      try {
        // Fetch company sizes
        const sizesResponse = await apiClient.getCompanySizes()
        if (sizesResponse.data && sizesResponse.data.length > 0) {
          setCompanySizeOptions(
            sizesResponse.data.map((item: any) => ({
              value: item.code || item.value,
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
          setContactStatusOptions(statusesResponse.data.map((item: any) => item.label))
        }
      } catch (error) {
        console.error('Failed to fetch contact statuses, using fallback:', error)
      }
    }

    fetchReferenceData()
  }, [])

  const updateCriteria = (key: keyof FilterOptions, value: string | undefined) => {
    setTempCriteria((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const handleApply = () => {
    onApplyScoring(tempCriteria)
  }

  const handleClear = () => {
    setTempCriteria({})
    onClearScoring()
  }

  const activeCriteriaCount = Object.values(tempCriteria).filter(Boolean).length

  return (
    <Card className={isActive ? "border-primary bg-primary/5" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Lead Scoring (Smart Filtering)
          {isActive && (
            <Badge variant="default" className="ml-2">
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Apply intelligent filtering to rank companies by matching conditions. Companies don&apos;t need to match all
          criteria to appear in results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Industrial Name</label>
            <Select
              value={tempCriteria.industrial || "Any Industry"}
              onValueChange={(value) => updateCriteria("industrial", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Industry">Any Industry</SelectItem>
                {industrialOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Province</label>
            <Select
              value={tempCriteria.province || "Any Province"}
              onValueChange={(value) => updateCriteria("province", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Province">Any Province</SelectItem>
                {provinceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <Select
              value={tempCriteria.companySize || "Any Size"}
              onValueChange={(value) => updateCriteria("companySize", value as "S" | "M" | "L")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Size">Any Size</SelectItem>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Status</label>
            <Select
              value={tempCriteria.contactStatus || "Any Status"}
              onValueChange={(value) => updateCriteria("contactStatus", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Status">Any Status</SelectItem>
                {contactStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{activeCriteriaCount} criteria selected</span>
            {activeCriteriaCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setTempCriteria({})}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {isActive && (
              <Button variant="outline" onClick={handleClear}>
                Stop Scoring
              </Button>
            )}
            <Button onClick={handleApply} disabled={activeCriteriaCount === 0} className="gap-2">
              <Zap className="h-4 w-4" />
              Apply Smart Filtering
            </Button>
          </div>
        </div>

        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>Scoring Active:</strong> Companies are ranked by how well they match your criteria. Higher scores
              indicate better matches.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
