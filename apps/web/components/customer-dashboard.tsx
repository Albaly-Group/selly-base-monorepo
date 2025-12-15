"use client"

import { useAuth, canManageDatabase, canManageOrganizationUsers } from "@/lib/auth"
import { useTranslation } from 'react-i18next'
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Users, Target, Database, BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface DashboardStats {
  totalCompanies: number
  totalLists: number
  dataQualityScore: number
  monthlyGrowth: {
    companies: number
    exports: number
    users: number
  }
}

export function CustomerDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orgId = user?.organization_id
    if (!orgId) return

    const fetchDashboardData = async (organizationId: string) => {
      try {
        setError(null)
        const [analyticsData, listsData] = await Promise.all([
          apiClient.getDashboardAnalytics(organizationId),
          apiClient.getCompanyLists({ organizationId }).catch(() => ({ data: [] }))
        ])

        setStats({
          totalCompanies: analyticsData.totalCompanies || 0,
          totalLists: Array.isArray(listsData.data) ? listsData.data.length : 0,
          dataQualityScore: analyticsData.dataQualityScore || 0,
          monthlyGrowth: analyticsData.monthlyGrowth || { companies: 0, exports: 0, users: 0 }
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data. Please ensure the backend is running.')
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData(orgId)
  }, [user])

  if (!user) return null

  // Show error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2 text-red-800">{t('dashboard.failed_title')}</h3>
                <p className="text-gray-600 mb-4">{t('dashboard.failed_message', { error })}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  {t('dashboard.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const userFeatures = [
    {
      titleKey: "feature.company_lookup.title",
      descriptionKey: "feature.company_lookup.description",
      icon: Search,
      href: "/lookup",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      titleKey: "feature.my_lists.title",
      descriptionKey: "feature.my_lists.description",
      icon: Users,
      href: "/lists",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    // {
    //   title: "Lead Scoring",
    //   description: "Use intelligent filtering to prioritize your prospects",
    //   icon: Target,
    //   href: "/lists",
    //   color: "text-purple-600",
    //   bgColor: "bg-purple-50",
    // },
  ]

  const staffFeatures = [
    {
      titleKey: "feature.database_management.title",
      descriptionKey: "feature.database_management.description",
      icon: Database,
      href: "/staff",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      titleKey: "feature.analytics.title",
      descriptionKey: "feature.analytics.description",
      icon: BarChart3,
      href: "/staff/analytics",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  const availableFeatures = canManageDatabase(user)
    ? [...userFeatures, ...staffFeatures]
    : userFeatures

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.welcome_back', { name: user.name })}</h1>
          <p className="text-gray-600">
            {!canManageDatabase(user) && t('dashboard.description.general')}
            {canManageDatabase(user) && !canManageOrganizationUsers(user) && t('dashboard.description.manage_db')}
            {canManageOrganizationUsers(user) && t('dashboard.description.full_access')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.total_companies')}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.totalCompanies.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">{t('dashboard.from_last_month', { value: stats?.monthlyGrowth.companies || 0 })}</p>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.active_lists')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.totalLists || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {!canManageDatabase(user) ? t('dashboard.your_saved_lists') : t('dashboard.platform_wide')}
              </p>
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.data_quality')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : Math.round((stats?.dataQualityScore || 0) * 100) + "%"}
              </div>
              <p className="text-xs text-muted-foreground">{t('dashboard.average_completeness')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.titleKey} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                  <CardDescription>{t(feature.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full transition transform active:scale-95">
                    <Link href={feature.href}>{t('dashboard.get_started')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quick_actions')}</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/lookup">
                <Search className="h-4 w-4 mr-2" />
                {t('dashboard.search_companies')}
              </Link>
            </Button>

            {canManageDatabase(user) && (
              <Button variant="outline" asChild>
                <Link href="/staff">
                  <Database className="h-4 w-4 mr-2" />
                  {t('dashboard.manage_database')}
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild>
                <Link href="/lists">
                  <Users className="h-4 w-4 mr-2" />
                {t('dashboard.apply_my_lists')}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
