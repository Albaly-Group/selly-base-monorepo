"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Target, Save, Settings, Filter } from "lucide-react"

// Scoring preset interface per spec Section 7
interface ScoringPreset {
  id: string
  name: string
  description: string
  weights: {
    industry: number
    province: number
    companySize: number
    contactStatus: number
    hasPhone: number
    hasEmail: number
    hasDecisionMaker: number
    dataCompleteness: number
  }
  createdBy: string
}

// Mock scoring presets
const mockPresets: ScoringPreset[] = [
  {
    id: "1",
    name: "Logistics Focus",
    description: "Optimized for logistics companies in Bangkok area",
    weights: {
      industry: 35,
      province: 25,
      companySize: 10,
      contactStatus: 10,
      hasPhone: 8,
      hasEmail: 6,
      hasDecisionMaker: 10,
      dataCompleteness: 5,
    },
    createdBy: "Admin",
  },
  {
    id: "2", 
    name: "Manufacturing B2B",
    description: "Focused on large manufacturing companies",
    weights: {
      industry: 35,
      province: 15,
      companySize: 20,
      contactStatus: 10,
      hasPhone: 8,
      hasEmail: 6,
      hasDecisionMaker: 15,
      dataCompleteness: 5,
    },
    createdBy: "Sales Manager",
  }
]

function ScoringPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [customWeights, setCustomWeights] = useState({
    industry: 35,
    province: 25,
    companySize: 10,
    contactStatus: 10,
    hasPhone: 8,
    hasEmail: 6,
    hasDecisionMaker: 10,
    dataCompleteness: 5,
  })

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = mockPresets.find(p => p.id === presetId)
    if (preset) {
      setCustomWeights(preset.weights)
    }
  }

  const handleSavePreset = () => {
    console.log("Saving custom preset with weights:", customWeights)
    // Here you would save the preset
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scoring Configuration</h1>
          <p className="text-gray-600">Configure lead scoring weights and manage presets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scoring Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scoring Presets
              </CardTitle>
              <CardDescription>
                Pre-configured scoring templates for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Preset</Label>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Custom Configuration</SelectItem>
                    {mockPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  {(() => {
                    const preset = mockPresets.find(p => p.id === selectedPreset)
                    return preset ? (
                      <div>
                        <h4 className="font-medium text-blue-900">{preset.name}</h4>
                        <p className="text-sm text-blue-700">{preset.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          Created by {preset.createdBy}
                        </Badge>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div className="space-y-3">
                {mockPresets.map((preset) => (
                  <div 
                    key={preset.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="outline">{preset.createdBy}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weight Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Weight Configuration
              </CardTitle>
              <CardDescription>
                Customize scoring weights according to your criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Condition Weights */}
              <div className="space-y-4">
                <h4 className="font-medium">Condition Matches</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label>Industry Match: {customWeights.industry} points</Label>
                    <Slider
                      value={[customWeights.industry]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, industry: value}))}
                      max={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Province Match: {customWeights.province} points</Label>
                    <Slider
                      value={[customWeights.province]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, province: value}))}
                      max={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Company Size Match: {customWeights.companySize} points</Label>
                    <Slider
                      value={[customWeights.companySize]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, companySize: value}))}
                      max={30}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Contact Status: {customWeights.contactStatus} points</Label>
                    <Slider
                      value={[customWeights.contactStatus]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, contactStatus: value}))}
                      max={20}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Signal Weights */}
              <div className="space-y-4">
                <h4 className="font-medium">Signal Bonuses</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label>Has Phone: {customWeights.hasPhone} points</Label>
                    <Slider
                      value={[customWeights.hasPhone]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, hasPhone: value}))}
                      max={15}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Has Email: {customWeights.hasEmail} points</Label>
                    <Slider
                      value={[customWeights.hasEmail]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, hasEmail: value}))}
                      max={15}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Has Decision Maker: {customWeights.hasDecisionMaker} points</Label>
                    <Slider
                      value={[customWeights.hasDecisionMaker]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, hasDecisionMaker: value}))}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Data Completeness Multiplier: {customWeights.dataCompleteness}x</Label>
                    <Slider
                      value={[customWeights.dataCompleteness]}
                      onValueChange={([value]) => setCustomWeights(prev => ({...prev, dataCompleteness: value}))}
                      max={10}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSavePreset} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save as Preset
                </Button>
                <Button variant="outline">
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Configuration Summary</CardTitle>
            <CardDescription>
              Total possible score: {Object.values(customWeights).reduce((sum, weight) => sum + weight, 0)} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(customWeights).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{value}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ScoringPage
