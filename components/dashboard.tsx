"use client"

import { useAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Users, Target, Database, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"

export function Dashboard() {
  const { user } = useAuth()

  if (!user) return null

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
    {
      title: "Lead Scoring",
      description: "Use intelligent filtering to prioritize your prospects",
      icon: Target,
      href: "/lists",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
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

  const availableFeatures =
    user.role === "user"
      ? userFeatures
      : user.role === "staff" || user.role === "admin"
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
            {user.role === "user" &&
              "Discover and manage your business prospects with powerful search and filtering tools."}
            {user.role === "staff" && "Manage the company database and moderate user submissions."}
            {user.role === "admin" && "Full access to all platform features and administrative controls."}
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
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.role === "user" ? "3" : "156"}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === "user" ? "Your saved lists" : "Platform-wide"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
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
                  <Button asChild className="w-full">
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

            {(user.role === "staff" || user.role === "admin") && (
              <Button variant="outline" asChild>
                <Link href="/staff">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Database
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/lists">
                <Target className="h-4 w-4 mr-2" />
                Apply Lead Scoring
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
