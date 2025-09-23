"use client"

import { Navigation } from "@/components/navigation"
import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  Cell,
  LineChart,
  Line
} from "recharts"
import { TrendingUp, Users, Phone, Target, AlertTriangle, CheckCircle } from "lucide-react"

function ReportsPage() {
  // Mock data for reports
  const funnelData = [
    { stage: "Companies", count: 1250, percentage: 100 },
    { stage: "Dialed", count: 875, percentage: 70 },
    { stage: "Reached", count: 520, percentage: 42 },
    { stage: "Qualified", count: 156, percentage: 12 },
    { stage: "Opportunities", count: 43, percentage: 3 }
  ]

  const dataQualityData = [
    { name: "Active", value: 65, color: "#10b981" },
    { name: "Needs Verification", value: 25, color: "#f59e0b" },
    { name: "Invalid", value: 10, color: "#ef4444" }
  ]

  const activityData = [
    { rep: "John Doe", calls: 145, reached: 87, qualified: 23, followups: 12 },
    { rep: "Jane Smith", calls: 132, reached: 95, qualified: 31, followups: 8 },
    { rep: "Mike Johnson", calls: 98, reached: 62, qualified: 18, followups: 15 },
    { rep: "Sarah Wilson", calls: 156, reached: 102, qualified: 28, followups: 6 }
  ]

  const completenessData = [
    { range: "90-100%", count: 312 },
    { range: "80-89%", count: 428 },
    { range: "70-79%", count: 285 },
    { range: "60-69%", count: 156 },
    { range: "50-59%", count: 69 }
  ]

  const weeklyActivityData = [
    { week: "Week 1", calls: 245, qualified: 18 },
    { week: "Week 2", calls: 289, qualified: 23 },
    { week: "Week 3", calls: 356, qualified: 31 },
    { week: "Week 4", calls: 298, qualified: 25 }
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Calls Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">875</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Reach Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">59%</div>
              <p className="text-xs text-gray-600">520 / 875 calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Qualified Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Data Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <p className="text-xs text-gray-600">Avg. completeness</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>Conversion rates through the sales process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{stage.count.toLocaleString()}</span>
                        <Badge variant="secondary">{stage.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Distribution */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rep Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Rep Activity</CardTitle>
              <CardDescription>Individual performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rep" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calls" fill="#3b82f6" name="Calls Made" />
                    <Bar dataKey="qualified" fill="#10b981" name="Qualified" />
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

        {/* Weekly Activity Trend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Weekly Activity Trend</CardTitle>
            <CardDescription>Calls and qualifications over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#3b82f6" name="Calls Made" strokeWidth={2} />
                  <Line type="monotone" dataKey="qualified" stroke="#10b981" name="Qualified" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default requireAuth(["staff", "admin"])(ReportsPage)