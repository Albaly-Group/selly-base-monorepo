"use client"

import { useState, useEffect } from "react"
import { useAuth, canManageTenants } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Database, Settings, BarChart3, Building2, Globe } from "lucide-react"
import Link from "next/link"
import { getTotalUsers, getActiveTenants } from "@/lib/platform-admin-data"

export function PlatformAdminDashboard() {
  const { user } = useAuth()
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeTenants, setActiveTenants] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersCount, tenantsCount] = await Promise.all([
          getTotalUsers(),
          getActiveTenants()
        ])
        setTotalUsers(usersCount)
        setActiveTenants(tenantsCount)
      } catch (error) {
        console.error('Failed to fetch platform data:', error)
        // Keep default values of 0 on error
      } finally {
        setLoading(false)
      }
    }

    if (user && canManageTenants(user)) {
      fetchData()
    }
  }, [user])

  if (!user || !canManageTenants(user)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center text-red-600">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p>You don&apos;t have platform admin privileges.</p>
          </div>
        </main>
      </div>
    )
  }

  const platformFeatures = [
    {
      title: "Tenant Management",
      description: "Manage all customer organizations and their subscriptions",
      icon: Building2,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: loading ? "Loading..." : `${activeTenants} Active Tenants`
    },
    {
      title: "Platform Users",
      description: "Cross-tenant user directory and administration",
      icon: Users,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: loading ? "Loading..." : `${totalUsers} Total Users`
    },
    {
      title: "Shared Data",
      description: "Manage shared company database available to all tenants",
      icon: Database,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "45.2K Companies"
    },
    {
      title: "Analytics",
      description: "Platform-wide metrics and usage analytics",
      icon: BarChart3,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "99.9% Uptime"
    },
    {
      title: "Platform Settings",
      description: "System configuration and security settings",
      icon: Settings,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "All Systems Green"
    },
    {
      title: "Global Overview",
      description: "System health and cross-tenant monitoring",
      icon: Globe,
      href: "/platform-admin",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: "Real-time Monitoring"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Platform Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Platform Admin
                </Badge>
                <span className="text-sm text-gray-500">Albaly System Management</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Welcome to the Albaly platform administration dashboard. Here you can manage all customer organizations, 
            shared data resources, and system-wide settings across the entire Selly Base platform.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Tenants</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : activeTenants}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shared Companies</p>
                  <p className="text-2xl font-bold text-purple-600">45.2K</p>
                </div>
                <Database className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                </div>
                <Globe className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={feature.href}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {feature.stats}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                            Manage →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common platform administration tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/platform-admin">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Add New Tenant
                </Button>
              </Link>
              <Link href="/platform-admin">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  View System Logs
                </Button>
              </Link>
              <Link href="/platform-admin">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Generate Reports
                </Button>
              </Link>
              <Link href="/platform-admin">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Manage Integrations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Warning Notice */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Platform Admin Notice</h4>
              <p className="text-sm text-amber-700">
                You are logged in as a platform administrator with cross-tenant access. All actions performed here 
                affect the entire Selly Base platform and all customer organizations. Use with caution.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}