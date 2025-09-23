"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ImportWizard } from "@/components/import-wizard"
import { ImportJobsTable } from "@/components/import-jobs-table"
import { requireAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database } from "lucide-react"

function ImportsPage() {
  const [showImportWizard, setShowImportWizard] = useState(false)
  
  // Mock import jobs data
  const importJobs = [
    {
      id: "1",
      filename: "companies_q4_2024.xlsx",
      status: "completed",
      totalRows: 1250,
      processedRows: 1180,
      errorRows: 70,
      createdAt: "2024-12-08T14:30:00Z",
      completedAt: "2024-12-08T14:32:15Z",
      importedBy: "admin@example.com"
    },
    {
      id: "2", 
      filename: "prospect_list_bangkok.csv",
      status: "processing",
      totalRows: 850,
      processedRows: 420,
      errorRows: 12,
      createdAt: "2024-12-08T15:15:00Z",
      importedBy: "staff@example.com"
    },
    {
      id: "3",
      filename: "vendor_contacts.xlsx", 
      status: "failed",
      totalRows: 320,
      processedRows: 0,
      errorRows: 320,
      createdAt: "2024-12-08T13:45:00Z",
      failedAt: "2024-12-08T13:46:30Z",
      importedBy: "admin@example.com",
      errorMessage: "Invalid file format: Missing required column 'registration_id'"
    }
  ]

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
            <ImportJobsTable jobs={importJobs} />
          </TabsContent>
        </Tabs>

        {/* Import Wizard Dialog */}
        <ImportWizard 
          open={showImportWizard}
          onOpenChange={setShowImportWizard}
        />
      </main>
    </div>
  )
}

export default requireAuth(["admin"])(ImportsPage)