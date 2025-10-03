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

function ReportsPage() {
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
        setError('Failed to load analytics data. Please ensure the backend is running.');
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
            <span className="ml-2 text-gray-600">Loading analytics...</span>
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
            <p className="text-red-800">{error || 'Failed to load analytics data'}</p>
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

  // Mock data for charts (will be replaced with backend data when available)
  const dataQualityData = [
    { name: "High Quality", value: 65, color: "#10b981" },
    { name: "Medium Quality", value: 25, color: "#f59e0b" },
    { name: "Low Quality", value: 10, color: "#ef4444" }
  ]

  const industryChartData = [
    { name: "Manufacturing", count: 150 },
    { name: "Services", count: 120 },
    { name: "Technology", count: 90 },
    { name: "Retail", count: 75 },
  ]

  const provinceChartData = [
    { name: "Bangkok", count: 200 },
    { name: "Chiang Mai", count: 80 },
    { name: "Phuket", count: 60 },
    { name: "Others", count: 95 },
  ]

  const completenessData = [
    { range: "90-100%", count: 180 },
    { range: "80-89%", count: 120 },
    { range: "70-79%", count: 80 },
    { range: "60-69%", count: 40 },
    { range: "50-59%", count: 15 },
    { range: "Below 50%", count: 10 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Track performance and data quality metrics</p>
        </div>

        {/* Time Period Filter */}
        <div className="mb-6">
          <Select defaultValue="30days">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-gray-600">In your database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompanies}</div>
              <p className="text-xs text-green-600">
                {Math.round((activeCompanies / totalCompanies) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Needs Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{needsVerificationCompanies + invalidCompanies}</div>
              <p className="text-xs text-orange-600">Verification required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Data Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCompleteness}%</div>
              <p className="text-xs text-gray-600">Avg. completeness</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Industry Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Distribution</CardTitle>
              <CardDescription>Companies by industry sector</CardDescription>
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
              <CardTitle>Data Quality Status</CardTitle>
              <CardDescription>Distribution of verification statuses</CardDescription>
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
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Companies by province</CardDescription>
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
              <CardTitle>Data Completeness</CardTitle>
              <CardDescription>Distribution of data quality scores</CardDescription>
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
              Future Features (Not Yet Available)
            </CardTitle>
            <CardDescription>The following features will be implemented in future releases with platform admin access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Sales Activity Tracking</div>
                <div className="text-gray-600 mt-1">Future: Track sales activities and performance</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Sales Rep Performance</div>
                <div className="text-gray-600 mt-1">Future: Individual representative analytics</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Activity Trends</div>
                <div className="text-gray-600 mt-1">Future: Historical performance trends</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Lead Scoring Analytics</div>
                <div className="text-gray-600 mt-1">Future: AI-powered lead insights</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Platform-wide Metrics</div>
                <div className="text-gray-600 mt-1">Future: Cross-customer aggregated data</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Advanced Reporting</div>
                <div className="text-gray-600 mt-1">Future: Custom reports and data exports</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-800 text-sm">
                <strong>Current Scope:</strong> As a customer admin, you see reports based only on your organization&apos;s company data. 
                Call tracking, sales metrics, and platform-wide analytics are not yet available but will be added with future platform admin features.
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default requireAuth(["reports:view", "*"])(ReportsPage)