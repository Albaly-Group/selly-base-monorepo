"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, Target, Save, Plus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export interface SmartFilteringCriteria {
  keyword?: string
  keywordWeight?: number
  industrial?: string
  industrialWeight?: number
  province?: string
  provinceWeight?: number
  companySize?: string
  companySizeWeight?: number
  contactStatus?: string
  contactStatusWeight?: number
  minimumScore?: number
  profileName?: string
}

interface SmartFilteringPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  criteria: SmartFilteringCriteria
  onApplyFiltering: (criteria: SmartFilteringCriteria) => void
  onClearFiltering: () => void
  triggerType?: "button" | "search" // To handle different trigger types
  initialKeyword?: string // For when triggered from search
}

const industrialOptions = [
  "Manufacturing",
  "Logistics", 
  "Automotive",
  "Tourism",
  "Agriculture",
  "Technology",
  "Healthcare",
]

const provinceOptions = ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Chonburi", "Rayong", "Samut Prakan"]

const companySizeOptions = [
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
]

const contactStatusOptions = ["Active", "Needs Verification", "Invalid"]

export function SmartFilteringPanel({
  isOpen,
  onOpenChange,
  criteria,
  onApplyFiltering,
  onClearFiltering,
  triggerType = "button",
  initialKeyword = "",
}: SmartFilteringPanelProps) {
  const [tempCriteria, setTempCriteria] = useState<SmartFilteringCriteria>({
    ...criteria,
    keyword: initialKeyword || criteria.keyword || "",
    keywordWeight: criteria.keywordWeight || 25,
    industrialWeight: criteria.industrialWeight || 25,
    provinceWeight: criteria.provinceWeight || 20,
    companySizeWeight: criteria.companySizeWeight || 15,
    contactStatusWeight: criteria.contactStatusWeight || 15,
    minimumScore: criteria.minimumScore || 0,
  })

  const updateCriteria = (key: keyof SmartFilteringCriteria, value: any) => {
    setTempCriteria((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

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
      contactStatusWeight: 15,
      minimumScore: 0,
    })
    onClearFiltering()
  }

  const totalWeight = (tempCriteria.keywordWeight || 0) + 
                     (tempCriteria.industrialWeight || 0) + 
                     (tempCriteria.provinceWeight || 0) + 
                     (tempCriteria.companySizeWeight || 0) + 
                     (tempCriteria.contactStatusWeight || 0)

  const hasActiveCriteria = Object.values(tempCriteria).some((value, index) => {
    const keys = Object.keys(tempCriteria)
    const key = keys[index]
    // Skip weight fields and minimumScore for active criteria check
    if (key.includes('Weight') || key === 'minimumScore' || key === 'profileName') return false
    return value !== undefined && value !== ""
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Smart Filtering & Lead Scoring
            {hasActiveCriteria && (
              <Badge variant="default" className="ml-2">
                Active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Keyword Search Section */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Keyword Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="mb-2" htmlFor="keyword">Search Keyword</Label>
                <Input
                  id="keyword"
                  className="shadow-sm "
                  placeholder="Company name, registration number, or keywords..."
                  value={tempCriteria.keyword || ""}
                  onChange={(e) => updateCriteria("keyword", e.target.value)}
                />
              </div>
              <div>
                <Label>Keyword Weight: {tempCriteria.keywordWeight}%</Label>
                <Slider
                  value={[tempCriteria.keywordWeight ?? 25]}
                  onValueChange={(value) => updateCriteria("keywordWeight", value[0])}
                  max={50}
                  step={5}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Attribute Filtering Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Attribute Filters & Weights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry */}
                <div className="space-y-3">
                  <Label>Industry</Label>
                  <Select
                    value={tempCriteria.industrial || ""}
                    onValueChange={(value) => updateCriteria("industrial", value === "any" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Industry</SelectItem>
                      {industrialOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">Weight: {tempCriteria.industrialWeight}%</Label>
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
                  <Label>Province</Label>
                  <Select
                    value={tempCriteria.province || ""}
                    onValueChange={(value) => updateCriteria("province", value === "any" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Province</SelectItem>
                      {provinceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">Weight: {tempCriteria.provinceWeight}%</Label>
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
                  <Label>Company Size</Label>
                  <Select
                    value={tempCriteria.companySize || ""}
                    onValueChange={(value) => updateCriteria("companySize", value === "any" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Size</SelectItem>
                      {companySizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">Weight: {tempCriteria.companySizeWeight}%</Label>
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
                  <Label>Contact Status</Label>
                  <Select
                    value={tempCriteria.contactStatus || ""}
                    onValueChange={(value) => updateCriteria("contactStatus", value === "any" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Status</SelectItem>
                      {contactStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Label className="text-sm">Weight: {tempCriteria.contactStatusWeight}%</Label>
                    <Slider
                      value={[tempCriteria.contactStatusWeight ?? 15]}
                      onValueChange={(value) => updateCriteria("contactStatusWeight", value[0])}
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
                  <span className="font-medium">Total Weight</span>
                  <Badge variant={totalWeight === 100 ? "default" : "secondary"}>
                    {totalWeight}% 
                  </Badge>
                </div>
                {totalWeight !== 100 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Weights don't need to total 100%. Results will be normalized.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Minimum Score Threshold */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Minimum Weighted Score: {tempCriteria.minimumScore}%</Label>
                <Slider
                  value={[tempCriteria.minimumScore ?? 0]}
                  onValueChange={(value) => updateCriteria("minimumScore", value[0])}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Only show companies with a weighted score above this threshold
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Profile */}
          <Card>
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
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Smart Filtering
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
              Clear All
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}