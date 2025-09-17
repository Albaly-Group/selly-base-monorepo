"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, RefreshCw } from "lucide-react"

interface ImportJob {
  id: string
  fileName: string
  status: "uploading" | "mapping" | "validating" | "processing" | "completed" | "failed"
  progress: number
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  createdAt: string
  completedAt?: string
  errorFileUrl?: string
}

// Mock import jobs
const mockImportJobs: ImportJob[] = [
  {
    id: "1",
    fileName: "bangkok_companies_2024.xlsx",
    status: "completed",
    progress: 100,
    totalRows: 1250,
    validRows: 1180,
    invalidRows: 45,
    duplicateRows: 25,
    createdAt: "2024-12-08T09:00:00Z",
    completedAt: "2024-12-08T09:15:00Z",
    errorFileUrl: "/downloads/errors_bangkok_companies_2024.csv"
  },
  {
    id: "2",
    fileName: "manufacturing_prospects.csv",
    status: "processing",
    progress: 67,
    totalRows: 890,
    validRows: 520,
    invalidRows: 15,
    duplicateRows: 8,
    createdAt: "2024-12-08T10:30:00Z",
  },
]

const columnMappings = [
  { field: "company_name", label: "Company Name", required: true },
  { field: "registration_id", label: "Registration ID", required: false },
  { field: "industry", label: "Industry", required: false },
  { field: "province", label: "Province", required: false },
  { field: "contact_name", label: "Contact Name", required: false },
  { field: "phone", label: "Phone", required: false },
  { field: "email", label: "Email", required: false },
  { field: "website", label: "Website", required: false },
  { field: "notes", label: "Notes", required: false },
]

function ImportsPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState<"upload" | "mapping" | "validation" | "processing">("upload")
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type.includes('sheet') || file.type.includes('csv')) {
      setUploadedFile(file)
      setCurrentStep("mapping")
      console.log("File uploaded:", file.name)
    } else {
      alert("Please upload an Excel (.xlsx) or CSV file")
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const getStatusIcon = (status: ImportJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "processing":
      case "uploading":
      case "mapping":
      case "validating":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: ImportJob["status"]) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      uploading: "secondary",
      mapping: "secondary",
      validating: "secondary",
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import</h1>
          <p className="text-gray-600">Import company data from Excel or CSV files</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">New Import</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {currentStep === "upload" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload File
                  </CardTitle>
                  <CardDescription>
                    Supported formats: Excel (.xlsx) and CSV files. Maximum 50,000 rows per import.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Drop your file here</h3>
                    <p className="text-gray-600 mb-4">or click to browse</p>
                    
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>

                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Data Requirements:</strong> Include Company Name (required), 13-digit Registration ID (recommended), 
                      Industry, Province, Contact details, and any additional fields you want to import.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {currentStep === "mapping" && uploadedFile && (
              <Card>
                <CardHeader>
                  <CardTitle>Column Mapping</CardTitle>
                  <CardDescription>
                    Map your file columns to our database fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline">File: {uploadedFile.name}</Badge>
                  </div>

                  <div className="space-y-4">
                    {columnMappings.map((mapping) => (
                      <div key={mapping.field} className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <span className={mapping.required ? "font-medium" : ""}>
                            {mapping.label}
                          </span>
                          {mapping.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={columnMapping[mapping.field] || ""}
                            onChange={(e) => setColumnMapping(prev => ({
                              ...prev,
                              [mapping.field]: e.target.value
                            }))}
                          >
                            <option value="">-- Select Column --</option>
                            <option value="column_a">Column A</option>
                            <option value="column_b">Column B</option>
                            <option value="column_c">Column C</option>
                            <option value="column_d">Column D</option>
                          </select>
                        </div>
                        <div className="text-sm text-gray-600">
                          {mapping.field === "registration_id" && "13 digits required"}
                          {mapping.field === "email" && "Valid email format"}
                          {mapping.field === "phone" && "Thai format preferred"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button onClick={() => setCurrentStep("validation")}>
                      Validate Data
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === "validation" && (
              <Card>
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                  <CardDescription>
                    Review data quality before importing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">845</div>
                      <div className="text-sm text-green-700">Valid Records</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">23</div>
                      <div className="text-sm text-yellow-700">Warnings</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">12</div>
                      <div className="text-sm text-red-700">Errors</div>
                    </div>
                  </div>

                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Common Issues Found:</strong> Invalid registration IDs (must be 13 digits), 
                      duplicate company names, missing required fields.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentStep("processing")}>
                      Import Valid Records
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Error Report
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep("mapping")}>
                      Back to Mapping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === "processing" && (
              <Card>
                <CardHeader>
                  <CardTitle>Import in Progress</CardTitle>
                  <CardDescription>
                    Processing your data import...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={67} className="w-full" />
                    <p className="text-sm text-gray-600">
                      Processing 520 of 845 records...
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated time remaining: 2 minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import History</CardTitle>
                <CardDescription>
                  Track your previous data imports and download error reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Rows</TableHead>
                      <TableHead>Valid</TableHead>
                      <TableHead>Invalid</TableHead>
                      <TableHead>Duplicates</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockImportJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{job.fileName}</span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>{job.totalRows.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">{job.validRows.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">{job.invalidRows.toLocaleString()}</TableCell>
                        <TableCell className="text-yellow-600">{job.duplicateRows.toLocaleString()}</TableCell>
                        <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {job.status === "completed" && job.errorFileUrl && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Errors
                            </Button>
                          )}
                          {job.status === "processing" && (
                            <Progress value={job.progress} className="w-20" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ImportsPage
