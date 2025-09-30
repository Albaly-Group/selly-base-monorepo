"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { TenantManagementTab } from "@/components/platform-admin/tenant-management-tab"
import { PlatformDataTab } from "@/components/platform-admin/platform-data-tab"
import { PlatformUsersTab } from "@/components/platform-admin/platform-users-tab"
import { PlatformAnalyticsTab } from "@/components/platform-admin/platform-analytics-tab"
import { PlatformSettingsTab } from "@/components/platform-admin/platform-settings-tab"
import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Database, BarChart3, Settings, Shield } from "lucide-react"
import { getTotalUsers, getTotalDataRecords, getActiveTenants, getPlatformAnalytics, mockSharedCompanies } from "@/lib/platform-admin-data"

function PlatformAdminPage() {
  const [platformData, setPlatformData] = useState({
    totalUsers: 0,
    totalData: 0,
    activeTenants: 0,
    systemHealth: 98.5,
    analytics: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true)
        const [totalUsers, totalData, activeTenants, analytics] = await Promise.all([
          getTotalUsers(),
          getTotalDataRecords(), 
          getActiveTenants(),
          getPlatformAnalytics()
        ])

        setPlatformData({
          totalUsers,
          totalData,
          activeTenants,
          systemHealth: 98.5, // Mock for now
          analytics
        })
      } catch (error) {
        console.error('Failed to fetch platform data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatformData()
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        {/* Header with Platform Admin Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Shield className="h-3 w-3 mr-1" />
              Platform Admin
            </Badge>
          </div>
          <p className="text-gray-600">
            Manage the entire Selly Base platform, tenant organizations, and shared data resources
          </p>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : platformData.activeTenants}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : platformData.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Companies</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : (platformData.analytics?.totalCompanies || mockSharedCompanies.length).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to all tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${platformData.systemHealth}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime this month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Shared Data
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Platform Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-6">
            <TenantManagementTab />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <PlatformDataTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <PlatformUsersTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PlatformAnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PlatformSettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default requireAuth(["platform_admin"])(PlatformAdminPage)