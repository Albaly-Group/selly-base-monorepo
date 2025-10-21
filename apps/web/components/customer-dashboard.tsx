"use client"

import { useAuth, canManageDatabase, canManageOrganizationUsers } from "@/lib/auth"
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
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null)
        const [analyticsData, listsData] = await Promise.all([
          apiClient.getDashboardAnalytics(user.organizationId),
          apiClient.getCompanyLists({ organizationId: user.organizationId }).catch(() => ({ data: [] }))
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

    if (user) {
      fetchDashboardData()
    }
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
                <h3 className="text-lg font-semibold mb-2 text-red-800">Failed to Load Dashboard</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
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
      title: "Company Lookup",
      description: "Search and discover companies in our comprehensive database",
      icon: Search,
      href: "/lookup",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "My Lists",
      description: "Manage your saved company lists and apply smart filtering",
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
      title: "Database Management",
      description: "Manage and moderate the company database",
      icon: Database,
      href: "/staff",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Analytics",
      description: "View platform usage and data quality metrics",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}</h1>
          <p className="text-gray-600">
            {!canManageDatabase(user) && "Discover and manage your business prospects with powerful search and filtering tools."}
            {canManageDatabase(user) && !canManageOrganizationUsers(user) && "Manage the company database and moderate user submissions."}
            {canManageOrganizationUsers(user) && "Full access to all platform features and administrative controls."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.totalCompanies.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats?.monthlyGrowth.companies || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.totalLists || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {!canManageDatabase(user) ? "Your saved lists" : "Platform-wide"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : Math.round((stats?.dataQualityScore || 0) * 100) + "%"}
              </div>
              <p className="text-xs text-muted-foreground">Average completeness</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full transition transform active:scale-95">
                    <Link href={feature.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/lookup">
                <Search className="h-4 w-4 mr-2" />
                Search Companies
              </Link>
            </Button>

            {canManageDatabase(user) && (
              <Button variant="outline" asChild>
                <Link href="/staff">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Database
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/lists">
                <Users className="h-4 w-4 mr-2" />
                Apply My Lists
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
