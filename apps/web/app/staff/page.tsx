"use client"

import { useState, useMemo, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { StaffTable } from "@/components/staff-table"
import { CompanyEditDialog } from "@/components/company-edit-dialog"
import { BulkActionsPanel } from "@/components/bulk-actions-panel"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import type { Company, FilterOptions } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Upload, Download } from "lucide-react"

function StaffDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.searchCompanies({
          searchTerm: searchTerm || undefined,
          page: 1,
          limit: 1000 // Get all companies for staff management
        })
        
        if (response.data) {
          setCompanies(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error)
        setCompanies([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [searchTerm, refreshKey])

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    let filtered = companies

    // Apply additional filters if needed
    if (filters.industry) {
      filtered = filtered.filter(c => c.industrialName === filters.industry)
    }
    if (filters.province) {
      filtered = filtered.filter(c => c.province === filters.province)
    }
    if (filters.verificationStatus) {
      filtered = filtered.filter(c => c.verificationStatus === filters.verificationStatus)
    }

    return filtered
  }, [companies, filters])

  // Statistics
  const stats = useMemo(() => {
    const total = companies.length
    const active = companies.filter((c) => c.verificationStatus === "Active").length
    const needsVerification = companies.filter((c) => c.verificationStatus === "Needs Verification").length
    const invalid = companies.filter((c) => c.verificationStatus === "Invalid").length
    const avgCompleteness = total > 0 ? Math.round(companies.reduce((sum, c) => sum + (c.dataCompleteness || 0), 0) / total) : 0

    return { total, active, needsVerification, invalid, avgCompleteness }
  }, [companies])

  const handleSelectCompany = (companyId: string, selected: boolean) => {
    if (selected) {
      setSelectedCompanies((prev) => [...prev, companyId])
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCompanies(filteredCompanies.map((c) => c.id))
    } else {
      setSelectedCompanies([])
    }
  }

  const handleApprove = async (companyId: string) => {
    try {
      await apiClient.updateCompany(companyId, { verificationStatus: "Active" })
      setRefreshKey(prev => prev + 1) // Refresh the data
      console.log("Company approved:", companyId)
    } catch (error) {
      console.error("Error approving company:", error)
    }
  }

  const handleReject = async (companyId: string, reason: string) => {
    try {
      await apiClient.updateCompany(companyId, { 
        verificationStatus: "Invalid",
        rejectionReason: reason 
      })
      setRefreshKey(prev => prev + 1) // Refresh the data
      console.log("Company rejected:", companyId, "Reason:", reason)
    } catch (error) {
      console.error("Error rejecting company:", error)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
  }

  const handleBulkEdit = () => {
    if (selectedCompanies.length > 0) {
      setShowBulkActions(true)
    }
  }

  const handleImport = () => {
    // Simulate file import
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,.xlsx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("Importing file:", file.name)
        // Here you would process the file import
      }
    }
    input.click()
  }

  const handleExport = () => {
    const exportData =
      selectedCompanies.length > 0
        ? filteredCompanies.filter((c) => selectedCompanies.includes(c.id))
        : filteredCompanies

    const csvContent = [
      [
        "ID",
        "Company Name",
        "Industry",
        "Province",
        "Contact Person",
        "Phone",
        "Email",
        "Status",
        "Data Completeness",
        "Last Updated",
        "Created By",
      ],
      ...exportData.map((company) => [
        company.id,
        company.companyNameEn,
        company.industrialName,
        company.province,
        company.contactPersons[0]?.name || "",
        company.contactPersons[0]?.phone || "",
        company.contactPersons[0]?.email || "",
        company.verificationStatus,
        `${company.dataCompleteness}%`,
        company.lastUpdated,
        company.createdBy,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `staff-database-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
          <p className="text-gray-600">Manage and moderate the company database</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Needs Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsVerification}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Invalid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgCompleteness}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleImport} className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import Records
                </Button>
                <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export ({selectedCompanies.length || filteredCompanies.length})
                </Button>
                <Button onClick={handleBulkEdit} disabled={selectedCompanies.length === 0} className="gap-2">
                  Bulk Edit ({selectedCompanies.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <StaffTable
          companies={filteredCompanies}
          selectedCompanies={selectedCompanies}
          onSelectCompany={handleSelectCompany}
          onSelectAll={handleSelectAll}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEdit}
        />

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          {isLoading ? (
            "Loading companies..."
          ) : (
            <>
              Showing {filteredCompanies.length} of {companies.length} companies
              {selectedCompanies.length > 0 && ` • ${selectedCompanies.length} selected`}
            </>
          )}
        </div>

        {/* Edit Dialog */}
        <CompanyEditDialog
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onSave={async (updatedCompany) => {
            try {
              await apiClient.updateCompany(updatedCompany.id, updatedCompany)
              setRefreshKey(prev => prev + 1) // Refresh the data
              setEditingCompany(null)
              console.log("Company updated:", updatedCompany)
            } catch (error) {
              console.error("Error updating company:", error)
            }
          }}
        />

        {/* Bulk Actions Panel */}
        <BulkActionsPanel
          open={showBulkActions}
          onOpenChange={setShowBulkActions}
          selectedCompanyIds={selectedCompanies}
          onComplete={() => {
            setSelectedCompanies([])
            setShowBulkActions(false)
          }}
        />
      </main>
    </div>
  )
}

export default requireAuth(["database:manage", "*"])(StaffDashboardPage)
