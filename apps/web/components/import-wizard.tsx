"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, AlertTriangle, X } from "lucide-react"

interface ImportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: () => void
}

type ImportStep = "upload" | "mapping" | "validation" | "processing" | "complete"

export function ImportWizard({ open, onOpenChange, onImportComplete }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  
  // Mock detected columns from uploaded file
  const detectedColumns = [
    "Company Name", "Registration No", "Industry Type", "Province", 
    "Contact Name", "Phone Number", "Email Address", "Website"
  ]

  // Required field mappings for the system
  const requiredFields = {
    "company_name_en": "Company Name (English)",
    "registration_id": "Registration ID (13 digits)",
    "industry_name": "Industry/Sector",
    "province": "Province",
    "contact_name": "Contact Person Name",
    "phone": "Phone Number",
    "email": "Email Address",
    "website": "Website URL"
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setCurrentStep("mapping")
    }
  }

  const handleMappingChange = (systemField: string, columnName: string) => {
    setMappings(prev => ({
      ...prev,
      [systemField]: columnName
    }))
  }

  const proceedToValidation = () => {
    setCurrentStep("validation")
    // Mock validation process
    setTimeout(() => {
      setCurrentStep("processing")
      simulateProcessing()
    }, 2000)
  }

  const simulateProcessing = () => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.random() * 15
      if (current >= 100) {
        current = 100
        clearInterval(interval)
        setCurrentStep("complete")
      }
      setProgress(current)
    }, 200)
  }

  const mockValidationResults = {
    totalRows: 1250,
    validRows: 1180,
    invalidRows: 70,
    issues: [
      { row: 15, field: "registration_id", message: "Invalid format: must be 13 digits" },
      { row: 23, field: "email", message: "Invalid email format" },
      { row: 45, field: "registration_id", message: "Duplicate registration ID found" }
    ]
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Choose Excel (.xlsx) or CSV (.csv) file
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Maximum 50,000 rows
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.csv"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        )

      case "mapping":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <span className="font-medium">{uploadedFile?.name}</span>
              <Badge variant="secondary">{detectedColumns.length} columns detected</Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Map your columns to system fields:</h4>
              {Object.entries(requiredFields).map(([systemField, label]) => (
                <div key={systemField} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-500">{systemField}</div>
                  </div>
                  <Select 
                    value={mappings[systemField] || ""} 
                    onValueChange={(value) => handleMappingChange(systemField, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Skip this field</SelectItem>
                      {detectedColumns.map((col) => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )

      case "validation":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Validating data...</p>
            </div>
          </div>
        )

      case "processing":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing records...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((progress / 100) * mockValidationResults.validRows)}
                </div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {mockValidationResults.totalRows - Math.round((progress / 100) * mockValidationResults.validRows)}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{mockValidationResults.invalidRows}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <div>
              <h3 className="text-lg font-medium">Import Completed!</h3>
              <p className="text-gray-600">Successfully processed {mockValidationResults.validRows} records</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{mockValidationResults.validRows}</div>
                <div className="text-sm text-gray-600">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{mockValidationResults.invalidRows}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mockValidationResults.totalRows}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {mockValidationResults.invalidRows > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {mockValidationResults.invalidRows} records had errors. 
                  <Button variant="link" className="p-0 h-auto ml-1">
                    Download error report
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case "upload": return "Upload File"
      case "mapping": return "Map Columns"
      case "validation": return "Validate Data"
      case "processing": return "Processing Import"
      case "complete": return "Import Complete"
      default: return "Import Data"
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case "upload": return uploadedFile !== null
      case "mapping": return Object.keys(mappings).length > 0
      default: return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {currentStep === "upload" && "Select a file to import company data"}
            {currentStep === "mapping" && "Map your file columns to system fields"}
            {currentStep === "validation" && "Checking data quality and format"}
            {currentStep === "processing" && "Importing data into the system"}
            {currentStep === "complete" && "Import process finished"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        <DialogFooter>
          {currentStep === "upload" && (
            <Button 
              disabled={!canProceed()}
              onClick={() => setCurrentStep("mapping")}
            >
              Next: Map Columns
            </Button>
          )}
          
          {currentStep === "mapping" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                Back
              </Button>
              <Button 
                disabled={!canProceed()}
                onClick={proceedToValidation}
              >
                Validate & Import
              </Button>
            </div>
          )}

          {currentStep === "complete" && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}