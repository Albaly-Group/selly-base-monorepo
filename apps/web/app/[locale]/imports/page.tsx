"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ImportWizard } from "@/components/import-wizard"
import { ImportJobsTable } from "@/components/import-jobs-table"
import type { ImportJob } from "@/types/jobs"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Database } from "lucide-react"
import { useTranslations } from 'next-intl'

function ImportsPage() {
  const t = useTranslations('import')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('tabs.upload')}
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('tabs.jobs')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('supportedFormats.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="font-medium">{t('supportedFormats.xlsx.title')}</div>
                    <div className="text-gray-600">{t('supportedFormats.xlsx.subtitle')}</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{t('supportedFormats.csv.title')}</div>
                    <div className="text-gray-600">{t('supportedFormats.csv.subtitle')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('requiredFields.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div><span className="font-medium">company_name_en</span> - {t('requiredFields.company_name_en')}</div>
                  <div><span className="font-medium">registration_id</span> - {t('requiredFields.registration_id')}</div>
                  <div><span className="text-gray-600">{t('requiredFields.optionalLabel')}</span> {t('requiredFields.optional')}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dataProcessing.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>• {t('dataProcessing.item1')}</div>
                  <div>• {t('dataProcessing.item2')}</div>
                  <div>• {t('dataProcessing.item3')}</div>
                  <div>• {t('dataProcessing.item4')}</div>
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
                {t('actions.startImport')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">{t('loadingJobs')}</p>
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