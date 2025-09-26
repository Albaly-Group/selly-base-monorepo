"use client"

import { Navigation } from "@/components/navigation"
import { requireAuth } from "@/lib/auth"
import { mockCompanies } from "@/lib/mock-data"
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
import { TrendingUp, Users, CheckCircle, AlertTriangle } from "lucide-react"

function ReportsPage() {
  // Calculate actual data from mock companies for customer admin scope
  const totalCompanies = mockCompanies.length
  const activeCompanies = mockCompanies.filter((c) => c.verificationStatus === "Active").length
  const needsVerificationCompanies = mockCompanies.filter((c) => c.verificationStatus === "Needs Verification").length
  const invalidCompanies = mockCompanies.filter((c) => c.verificationStatus === "Invalid").length
  const avgCompleteness = Math.round(mockCompanies.reduce((sum, c) => sum + c.dataCompleteness, 0) / totalCompanies)

  // Data quality distribution based on actual company data
  const dataQualityData = [
    { name: "Active", value: Math.round((activeCompanies / totalCompanies) * 100), color: "#10b981" },
    { name: "Needs Verification", value: Math.round((needsVerificationCompanies / totalCompanies) * 100), color: "#f59e0b" },
    { name: "Invalid", value: Math.round((invalidCompanies / totalCompanies) * 100), color: "#ef4444" }
  ]

  // Industry distribution based on actual data
  const industryData = mockCompanies.reduce((acc, company) => {
    const industry = company.industrialName
    acc[industry] = (acc[industry] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const industryChartData = Object.entries(industryData).map(([name, count]) => ({
    name,
    count
  }))

  // Province distribution based on actual data
  const provinceData = mockCompanies.reduce((acc, company) => {
    const province = company.province
    acc[province] = (acc[province] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const provinceChartData = Object.entries(provinceData).map(([name, count]) => ({
    name,
    count
  }))

  // Data completeness distribution based on actual scores
  const completenessRanges = {
    "90-100%": 0,
    "80-89%": 0,
    "70-79%": 0,
    "60-69%": 0,
    "50-59%": 0,
    "Below 50%": 0
  }
  
  mockCompanies.forEach((company) => {
    const completeness = company.dataCompleteness
    if (completeness >= 90) completenessRanges["90-100%"]++
    else if (completeness >= 80) completenessRanges["80-89%"]++
    else if (completeness >= 70) completenessRanges["70-79%"]++
    else if (completeness >= 60) completenessRanges["60-69%"]++
    else if (completeness >= 50) completenessRanges["50-59%"]++
    else completenessRanges["Below 50%"]++
  })

  const completenessData = Object.entries(completenessRanges).map(([range, count]) => ({
    range,
    count
  }))

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
              Additional Features Coming Soon
            </CardTitle>
            <CardDescription>The following features will be available with platform admin access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Sales Activity Tracking</div>
                <div className="text-gray-600 mt-1">Call logs, reach rates, and conversion metrics</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Sales Rep Performance</div>
                <div className="text-gray-600 mt-1">Individual sales representative analytics</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Activity Trends</div>
                <div className="text-gray-600 mt-1">Historical performance and trend analysis</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Lead Scoring Analytics</div>
                <div className="text-gray-600 mt-1">AI-powered lead qualification insights</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Platform-wide Metrics</div>
                <div className="text-gray-600 mt-1">Cross-customer aggregated analytics</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Advanced Reporting</div>
                <div className="text-gray-600 mt-1">Custom reports and data exports</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-800 text-sm">
                <strong>Note:</strong> As a customer admin, you currently see reports based on your organization&apos;s data. 
                Platform admin features will provide system-wide analytics and advanced sales tracking capabilities.
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default requireAuth(["staff", "admin"])(ReportsPage)