"use client"

import { useState } from "react"
import { useAuth, canViewPlatformAnalytics } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Database, 
  Activity,
  Calendar,
  Globe,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { 
  mockTenantData, 
  mockPlatformUsers, 
  getTotalUsers, 
  getTotalDataRecords, 
  getActiveTenants,
  getTenantUsageLevel,
  type TenantData 
} from "@/lib/platform-admin-data"

export function PlatformAnalyticsTab() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("30d")
  
  // Check permissions
  if (!user || !canViewPlatformAnalytics(user)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have permission to view platform analytics. This feature requires platform admin privileges.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Generate analytics data using consistent platform data
  const tenantUsageData = mockTenantData.map(tenant => ({
    organizationId: tenant.id,
    organizationName: tenant.name,
    userCount: tenant.user_count,
    dataRecords: tenant.data_count,
    lastActivity: tenant.last_activity,
    usage: getTenantUsageLevel(tenant.data_count)
  }))

  const systemMetrics = {
    totalLogins: mockPlatformUsers.reduce((sum, user) => sum + user.loginCount, 0),
    averageSessionDuration: "24m 15s",
    dataQuality: 94.2,
    systemUptime: 99.9,
    storageUsed: "2.4 TB",
    apiCalls: 1245678
  }

  const growthMetrics = {
    newUsersThisMonth: 47,
    newOrganizations: 2,
    dataGrowth: 12.5,
    revenueGrowth: 8.3
  }

  const getUsageColor = (usage: string) => {
    switch (usage) {
      case "high": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Platform Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Platform-wide usage analytics and cross-tenant reporting
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.averageSessionDuration}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +3m from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.dataQuality}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              99.95% SLA target
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Tenant Usage</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tenant Usage Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tenant Usage Overview</CardTitle>
                <CardDescription>
                  Usage statistics across all customer organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Data Records</TableHead>
                      <TableHead>Usage Level</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantUsageData.map((tenant) => (
                      <TableRow key={tenant.organizationId}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{tenant.organizationName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {tenant.userCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3 text-muted-foreground" />
                            {tenant.dataRecords.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUsageColor(tenant.usage)}>
                            {tenant.usage}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(tenant.lastActivity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{growthMetrics.newOrganizations}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Growth</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{growthMetrics.dataGrowth}%</div>
                <p className="text-xs text-muted-foreground">
                  Month over month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{growthMetrics.revenueGrowth}%</div>
                <p className="text-xs text-muted-foreground">
                  Month over month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Technical performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Storage Used</span>
                  <span className="font-medium">{systemMetrics.storageUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Calls (30d)</span>
                  <span className="font-medium">{systemMetrics.apiCalls.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Response Time</span>
                  <span className="font-medium">147ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-medium text-green-600">0.02%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>
                  Database performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Query Performance</span>
                  <span className="font-medium text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Pool</span>
                  <span className="font-medium">78/100 active</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate</span>
                  <span className="font-medium">94.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Backup Status</span>
                  <span className="font-medium text-green-600">Up to date</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and subscription metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">$47,250</div>
                  <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$567,000</div>
                  <p className="text-sm text-muted-foreground">Annual Run Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-sm text-muted-foreground">Customer Retention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}