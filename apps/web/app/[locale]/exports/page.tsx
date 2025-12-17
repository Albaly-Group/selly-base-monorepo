"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ExportJobsTable } from "@/components/export-jobs-table"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Clock, CheckCircle } from "lucide-react"
import { useTranslations } from 'next-intl'
import type { ExportJob } from "@/types/jobs"

function ExportsPage() {
  const t = useTranslations('export')
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchExportJobs = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getExportJobs()
        setExportJobs(response.data || [])
      } catch (err) {
        console.error('Failed to fetch export jobs:', err)
        setError('Failed to load export jobs. Using demo data.')
      } finally {
        setLoading(false)
      }
    }

    fetchExportJobs()
  }, [])

  const activeExports = exportJobs.filter(job => job.status === "completed" && !job.expiresAt)
  const expiredExports = exportJobs.filter(job => job.status === "expired")
  const processingExports = exportJobs.filter(job => job.status === "processing")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('cards.availableDownloads.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeExports.length}</div>
              <p className="text-xs text-gray-500">{t('cards.availableDownloads.subtitle')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('cards.processing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingExports.length}</div>
              <p className="text-xs text-gray-500">{t('cards.processing.subtitle')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('cards.totalExports.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exportJobs.length}</div>
              <p className="text-xs text-gray-500">{t('cards.totalExports.subtitle')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('cards.dataVolume.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exportJobs.reduce((sum, job) => sum + job.totalRecords, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">{t('cards.dataVolume.subtitle')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Retention Policy Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">{t('retention.title')}</h3>
                <p className="text-sm text-blue-700 mt-1">{t('retention.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('table.title')}</CardTitle>
            <CardDescription>{t('table.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportJobsTable jobs={exportJobs} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default requireAuth(["data:export", "*"])(ExportsPage)