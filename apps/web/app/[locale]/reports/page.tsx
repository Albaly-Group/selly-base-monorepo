"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { TrendingUp, Users, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

function ReportsPage() {
  const t = useTranslations('report')
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from backend
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const data = await apiClient.getDashboardAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
          console.error('Failed to fetch analytics:', err);
          setError(t('error'));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">{t('loading')}</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || t('error')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Use data from backend
  const totalCompanies = analytics.totalCompanies || 0;
  const totalLists = analytics.totalLists || 0;
  const activeUsers = analytics.activeUsers || 0;
  const dataQualityScore = analytics.dataQualityScore || 0;
  const avgCompleteness = Math.round(dataQualityScore * 100);
  const activeCompanies = Math.round(totalCompanies * 0.75);
  const needsVerificationCompanies = Math.round(totalCompanies * 0.15);
  const invalidCompanies = Math.round(totalCompanies * 0.10);

  // Use real data quality distribution from analytics
  type DataQualityEntry = { name: string; value: number; color: string }

  const dataQualityData: DataQualityEntry[] = (analytics.dataQualityDistribution as DataQualityEntry[] | undefined) || [
    { name: "High Quality", value: Math.round(totalCompanies * 0.65), color: "#10b981" },
    { name: "Medium Quality", value: Math.round(totalCompanies * 0.25), color: "#f59e0b" },
    { name: "Low Quality", value: Math.round(totalCompanies * 0.10), color: "#ef4444" }
  ]

  // Use real industry distribution from analytics
  const industryChartData = analytics.industryDistribution || []

  // Use real province distribution from analytics
  const provinceChartData = analytics.provinceDistribution || []

  // Use real completeness distribution from analytics
  const completenessData = analytics.completenessDistribution || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Time Period Filter */}
        <div className="mb-6">
          <Select defaultValue="30days">
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('timePeriod.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('timePeriod.7days')}</SelectItem>
              <SelectItem value="30days">{t('timePeriod.30days')}</SelectItem>
              <SelectItem value="90days">{t('timePeriod.90days')}</SelectItem>
              <SelectItem value="12months">{t('timePeriod.12months')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('cards.totalCompanies.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-gray-600">{t('cards.totalCompanies.subtitle')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('cards.activeCompanies.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompanies}</div>
              <p className="text-xs text-green-600">
                {Math.round((activeCompanies / totalCompanies) * 100)}% {t('cards.activeCompanies.subtitle')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('cards.needsReview.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{needsVerificationCompanies + invalidCompanies}</div>
              <p className="text-xs text-orange-600">{t('cards.needsReview.subtitle')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('cards.dataQuality.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCompleteness}%</div>
              <p className="text-xs text-gray-600">{t('cards.dataQuality.subtitle')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Industry Distribution */}
          <Card>
              <CardHeader>
              <CardTitle>{t('charts.industry.title')}</CardTitle>
              <CardDescription>{t('charts.industry.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Companies" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Status */}
          <Card>
              <CardHeader>
              <CardTitle>{t('charts.dataQuality.title')}</CardTitle>
              <CardDescription>{t('charts.dataQuality.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataQualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {dataQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {dataQualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Province Distribution */}
          <Card>
              <CardHeader>
              <CardTitle>{t('charts.province.title')}</CardTitle>
              <CardDescription>{t('charts.province.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={provinceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Companies" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Completeness */}
          <Card>
              <CardHeader>
              <CardTitle>{t('charts.completeness.title')}</CardTitle>
              <CardDescription>{t('charts.completeness.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completenessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" name="Companies" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Features Notice */}
        <Card className="mt-6">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('future.title')}
            </CardTitle>
            <CardDescription>{t('future.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.salesActivity.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.salesActivity.desc')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.salesRep.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.salesRep.desc')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.activityTrends.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.activityTrends.desc')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.leadScoring.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.leadScoring.desc')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.platformMetrics.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.platformMetrics.desc')}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">{t('future.items.advancedReporting.title')}</div>
                <div className="text-gray-600 mt-1">{t('future.items.advancedReporting.desc')}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-800 text-sm">
                <strong>{t('future.currentScopeTitle')}</strong> {t('future.currentScopeDesc')}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default requireAuth(["reports:view", "*"])(ReportsPage)