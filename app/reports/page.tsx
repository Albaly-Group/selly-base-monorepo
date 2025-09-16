"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart, PieChart, TrendingUp, Users, CheckCircle, AlertCircle, Clock, Target } from "lucide-react"

// Mock report data
const funnelData = {
  companies: 1250,
  dialed: 890,
  reached: 445,
  qualified: 178,
  opportunities: 89,
}

const repActivityData = [
  { name: "John Doe", calls: 125, reached: 67, qualified: 23, followUps: 8 },
  { name: "Jane Smith", calls: 98, reached: 54, qualified: 19, followUps: 5 },
  { name: "Mike Wilson", calls: 87, reached: 41, qualified: 15, followUps: 12 },
  { name: "Sarah Connor", calls: 156, reached: 89, qualified: 31, followUps: 3 },
]

const dataQualityData = {
  totalCompanies: 1250,
  completenessDistribution: {
    "90-100%": 312,
    "70-89%": 445,
    "50-69%": 278,
    "30-49%": 156,
    "0-29%": 59,
  },
  verificationStatus: {
    Active: 789,
    "Needs Verification": 234,
    Invalid: 156,
    New: 71,
  },
  outdatedRecords: {
    "< 30 days": 445,
    "30-90 days": 378,
    "90-180 days": 234,
    "> 180 days": 193,
  }
}

function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30")
  
  const conversionRate = (reached: number, total: number) => 
    total > 0 ? Math.round((reached / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Track performance and data quality metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList>
            <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
            <TabsTrigger value="activity">Rep Activity</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Funnel Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{funnelData.companies.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">Total in database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dialed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{funnelData.dialed.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {conversionRate(funnelData.dialed, funnelData.companies)}% of companies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reached</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{funnelData.reached.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {conversionRate(funnelData.reached, funnelData.dialed)}% of dialed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{funnelData.qualified.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {conversionRate(funnelData.qualified, funnelData.reached)}% of reached
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{funnelData.opportunities.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {conversionRate(funnelData.opportunities, funnelData.qualified)}% of qualified
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Funnel Conversion
                </CardTitle>
                <CardDescription>
                  Conversion rates through the sales process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Companies → Dialed</span>
                      <span>{conversionRate(funnelData.dialed, funnelData.companies)}%</span>
                    </div>
                    <Progress value={conversionRate(funnelData.dialed, funnelData.companies)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Dialed → Reached</span>
                      <span>{conversionRate(funnelData.reached, funnelData.dialed)}%</span>
                    </div>
                    <Progress value={conversionRate(funnelData.reached, funnelData.dialed)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reached → Qualified</span>
                      <span>{conversionRate(funnelData.qualified, funnelData.reached)}%</span>
                    </div>
                    <Progress value={conversionRate(funnelData.qualified, funnelData.reached)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qualified → Opportunities</span>
                      <span>{conversionRate(funnelData.opportunities, funnelData.qualified)}%</span>
                    </div>
                    <Progress value={conversionRate(funnelData.opportunities, funnelData.qualified)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Rep Performance Summary
                  </CardTitle>
                  <CardDescription>
                    Last {timeRange} days activity overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repActivityData.map((rep) => (
                      <div key={rep.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{rep.name}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-blue-600">{rep.calls} calls</span>
                            <span className="text-green-600">{rep.qualified} qualified</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-1">
                              Reach Rate: {conversionRate(rep.reached, rep.calls)}%
                            </div>
                            <Progress value={conversionRate(rep.reached, rep.calls)} className="h-2" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-1">
                              Qualification Rate: {conversionRate(rep.qualified, rep.reached)}%
                            </div>
                            <Progress value={conversionRate(rep.qualified, rep.reached)} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Follow-ups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Follow-up Status
                  </CardTitle>
                  <CardDescription>
                    Pending follow-up activities by rep
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repActivityData.map((rep) => (
                      <div key={rep.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-sm text-gray-600">{rep.followUps} pending follow-ups</div>
                        </div>
                        <Badge variant={rep.followUps > 10 ? "destructive" : rep.followUps > 5 ? "secondary" : "default"}>
                          {rep.followUps > 10 ? "High" : rep.followUps > 5 ? "Medium" : "Low"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Data Completeness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Data Completeness
                  </CardTitle>
                  <CardDescription>
                    Distribution of data completeness scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dataQualityData.completenessDistribution).map(([range, count]) => (
                      <div key={range} className="flex items-center justify-between">
                        <span className="text-sm">{range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(count / dataQualityData.totalCompanies) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Verification Status
                  </CardTitle>
                  <CardDescription>
                    Company verification status distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dataQualityData.verificationStatus).map(([status, count]) => {
                      const percentage = (count / dataQualityData.totalCompanies) * 100
                      const color = status === "Active" ? "bg-green-600" : 
                                   status === "Needs Verification" ? "bg-yellow-600" :
                                   status === "Invalid" ? "bg-red-600" : "bg-gray-600"
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm">{status}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${color} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Data Freshness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Data Freshness
                  </CardTitle>
                  <CardDescription>
                    How recently records were updated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dataQualityData.outdatedRecords).map(([range, count]) => {
                      const percentage = (count / dataQualityData.totalCompanies) * 100
                      const color = range === "< 30 days" ? "bg-green-600" :
                                   range === "30-90 days" ? "bg-yellow-600" :
                                   range === "90-180 days" ? "bg-orange-600" : "bg-red-600"
                      
                      return (
                        <div key={range} className="flex items-center justify-between">
                          <span className="text-sm">{range}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${color} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Quality Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Summary</CardTitle>
                <CardDescription>
                  Overall health of your company database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(((dataQualityData.verificationStatus.Active / dataQualityData.totalCompanies) * 100))}%
                    </div>
                    <div className="text-sm text-green-700">Active Records</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((dataQualityData.completenessDistribution["90-100%"] + dataQualityData.completenessDistribution["70-89%"]) / dataQualityData.totalCompanies) * 100)}%
                    </div>
                    <div className="text-sm text-blue-700">High Quality Data</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(((dataQualityData.outdatedRecords["< 30 days"] + dataQualityData.outdatedRecords["30-90 days"]) / dataQualityData.totalCompanies) * 100)}%
                    </div>
                    <div className="text-sm text-yellow-700">Fresh Data</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {dataQualityData.outdatedRecords["> 180 days"]}
                    </div>
                    <div className="text-sm text-red-700">Stale Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default ReportsPage