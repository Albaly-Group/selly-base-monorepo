"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ImportWizard } from "@/components/import-wizard"
import { ImportJobsTable } from "@/components/import-jobs-table"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database } from "lucide-react"

interface ImportJob {
  id: string
  filename: string
  status: string
  totalRecords?: number
  processedRecords?: number
  validRecords?: number
  errorRecords?: number
  createdAt: string
  completedAt?: string
  uploadedBy?: string
  errorMessage?: string
}

function ImportsPage() {
  const [showImportWizard, setShowImportWizard] = useState(false)
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch import jobs from backend
  useEffect(() => {
    const fetchImportJobs = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getImportJobs()
        if (response.data) {
          setImportJobs(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch import jobs:', error)
        // Fallback to empty array if backend fails
        setImportJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchImportJobs()
  }, [])

  const refreshImportJobs = () => {
    const fetchImportJobs = async () => {
      try {
        const response = await apiClient.getImportJobs()
        if (response.data) {
          setImportJobs(response.data)
        }
      } catch (error) {
        console.error('Failed to refresh import jobs:', error)
      }
    }
    fetchImportJobs()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import</h1>
          <p className="text-gray-600">Import company data from Excel/CSV files with validation and mapping</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Import Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Supported Formats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-gray-600">Up to 50,000 rows</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-gray-600">UTF-8 encoding required</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div><span className="font-medium">company_name_en</span> - Company name (English)</div>
                  <div><span className="font-medium">registration_id</span> - 13-digit Thai registration ID</div>
                  <div><span className="text-gray-600">Optional:</span> industry, province, contact details</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>• Auto-detection of column mapping</div>
                  <div>• Validation and error reporting</div>
                  <div>• Duplicate detection by registration ID</div>
                  <div>• Merge or create new records</div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowImportWizard(true)}
                size="lg"
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Start New Import
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Loading import jobs...</p>
                </CardContent>
              </Card>
            ) : (
              <ImportJobsTable jobs={importJobs} onRefresh={refreshImportJobs} />
            )}
          </TabsContent>
        </Tabs>

        {/* Import Wizard Dialog */}
        <ImportWizard 
          open={showImportWizard}
          onOpenChange={setShowImportWizard}
          onImportComplete={refreshImportJobs}
        />
      </main>
    </div>
  )
}

export default requireAuth(["data:import", "*"])(ImportsPage)