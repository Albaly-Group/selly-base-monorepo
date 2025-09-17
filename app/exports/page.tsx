"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileSpreadsheet, Clock, CheckCircle, AlertCircle, RefreshCw, FileText } from "lucide-react"

interface ExportJob {
  id: string
  name: string
  format: "xlsx" | "csv"
  scope: "selected" | "list" | "filtered"
  status: "queued" | "processing" | "completed" | "failed"
  recordCount: number
  createdBy: string
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  expiresAt?: string
  fileSize?: string
}

// Mock export jobs
const mockExportJobs: ExportJob[] = [
  {
    id: "1",
    name: "Bangkok Logistics Leads - Full Export",
    format: "xlsx",
    scope: "list",
    status: "completed",
    recordCount: 245,
    createdBy: "john.doe@example.com",
    createdAt: "2024-12-08T10:30:00Z",
    completedAt: "2024-12-08T10:32:00Z",
    downloadUrl: "/downloads/bangkok-logistics-2024-12-08.xlsx",
    expiresAt: "2024-12-15T10:32:00Z",
    fileSize: "1.2 MB"
  },
  {
    id: "2", 
    name: "Manufacturing Prospects - Filtered Export",
    format: "csv",
    scope: "filtered",
    status: "processing",
    recordCount: 156,
    createdBy: "jane.smith@example.com",
    createdAt: "2024-12-08T11:15:00Z",
  },
  {
    id: "3",
    name: "Selected Companies Export",
    format: "xlsx", 
    scope: "selected",
    status: "failed",
    recordCount: 89,
    createdBy: "mike.wilson@example.com",
    createdAt: "2024-12-08T09:45:00Z",
    completedAt: "2024-12-08T09:46:00Z",
  },
  {
    id: "4",
    name: "Q4 Campaign Results",
    format: "csv",
    scope: "list",
    status: "completed",
    recordCount: 1420,
    createdBy: "sarah.connor@example.com",
    createdAt: "2024-12-07T16:00:00Z",
    completedAt: "2024-12-07T16:05:00Z",
    downloadUrl: "/downloads/q4-campaign-results.csv",
    expiresAt: "2024-12-14T16:05:00Z",
    fileSize: "8.7 MB"
  },
]

function ExportsPage() {
  const [selectedFormat, setSelectedFormat] = useState<"xlsx" | "csv">("xlsx")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "companyName", "industry", "province", "contactPerson", "phone", "email"
  ])

  const availableColumns = [
    { id: "companyName", label: "Company Name", required: true },
    { id: "companyNameTh", label: "Company Name (Thai)", required: false },
    { id: "registrationId", label: "Registration ID", required: false },
    { id: "industry", label: "Industry", required: false },
    { id: "province", label: "Province", required: false },
    { id: "companySize", label: "Company Size", required: false },
    { id: "contactPerson", label: "Contact Person", required: false },
    { id: "phone", label: "Phone", required: false },
    { id: "email", label: "Email", required: false },
    { id: "website", label: "Website", required: false },
    { id: "address", label: "Address", required: false },
    { id: "verificationStatus", label: "Verification Status", required: false },
    { id: "dataCompleteness", label: "Data Completeness", required: false },
    { id: "lastUpdated", label: "Last Updated", required: false },
    { id: "leadScore", label: "Lead Score", required: false },
    { id: "createdBy", label: "Created By", required: false },
  ]

  const getStatusIcon = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "processing":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      case "queued":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: ExportJob["status"]) => {
    const variants = {
      completed: "default",
      failed: "destructive", 
      processing: "secondary",
      queued: "secondary",
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getScopeLabel = (scope: ExportJob["scope"]) => {
    switch (scope) {
      case "selected": return "Selected Records"
      case "list": return "Full List"
      case "filtered": return "Filtered Results"
      default: return scope
    }
  }

  const handleColumnToggle = (columnId: string) => {
    const column = availableColumns.find(col => col.id === columnId)
    if (column?.required) return // Don't allow toggling required columns

    setSelectedColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId)
      } else {
        return [...prev, columnId]
      }
    })
  }

  const handleNewExport = () => {
    console.log("Creating new export with:", {
      format: selectedFormat,
      columns: selectedColumns
    })
    // Here you would trigger the export creation
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatFileSize = (bytes: string) => bytes

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Export</h1>
          <p className="text-gray-600">Export company data and manage download history</p>
        </div>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new">New Export</TabsTrigger>
            <TabsTrigger value="history">Export History</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Configuration</CardTitle>
                  <CardDescription>
                    Configure your data export settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Format Selection */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Export Format</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedFormat === "xlsx" ? "default" : "outline"}
                        onClick={() => setSelectedFormat("xlsx")}
                        className="flex items-center gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </Button>
                      <Button
                        variant={selectedFormat === "csv" ? "default" : "outline"}
                        onClick={() => setSelectedFormat("csv")}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        CSV (.csv)
                      </Button>
                    </div>
                  </div>

                  {/* Scope Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Export Scope</h4>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Current Selection:</strong> 245 companies from "Bangkok Logistics Leads" list
                      </div>
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="pt-4">
                    <Button onClick={handleNewExport} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Create Export ({selectedColumns.length} columns)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Column Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Column Selection</CardTitle>
                  <CardDescription>
                    Choose which fields to include in your export
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableColumns.map((column) => (
                      <div key={column.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={column.id}
                            checked={selectedColumns.includes(column.id)}
                            onChange={() => handleColumnToggle(column.id)}
                            disabled={column.required}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={column.id} className="text-sm font-medium">
                            {column.label}
                          </label>
                          {column.required && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Selected: {selectedColumns.length} of {availableColumns.length} columns
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export History</CardTitle>
                <CardDescription>
                  Download previous exports and track job status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Export Name</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExportJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <span className="font-medium">{job.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {job.format}
                          </Badge>
                        </TableCell>
                        <TableCell>{getScopeLabel(job.scope)}</TableCell>
                        <TableCell>{job.recordCount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-sm">{job.createdBy}</TableCell>
                        <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {job.status === "completed" && job.downloadUrl && (
                            <div className="flex flex-col gap-1">
                              {isExpired(job.expiresAt) ? (
                                <Badge variant="destructive" className="text-xs">Expired</Badge>
                              ) : (
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              )}
                              {job.fileSize && (
                                <span className="text-xs text-gray-500">{job.fileSize}</span>
                              )}
                              {job.expiresAt && !isExpired(job.expiresAt) && (
                                <span className="text-xs text-gray-500">
                                  Expires {new Date(job.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                          {job.status === "failed" && (
                            <Badge variant="destructive" className="text-xs">Failed</Badge>
                          )}
                          {job.status === "processing" && (
                            <Badge variant="secondary" className="text-xs">Processing...</Badge>
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

export default ExportsPage
