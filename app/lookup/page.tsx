"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { CompanySearch } from "@/components/company-search"
import { CompanyTable } from "@/components/company-table"
import { CompanyFilters } from "@/components/company-filters"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { mockCompanies, searchCompanies, filterCompanies } from "@/lib/mock-data"
import { requireAuth } from "@/lib/auth"
import type { FilterOptions, Company } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CompanyLookupPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showAddToListDialog, setShowAddToListDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyDetail, setShowCompanyDetail] = useState(false)

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    let companies = mockCompanies

    // Apply search
    if (searchTerm) {
      companies = searchCompanies(companies, searchTerm)
    }

    // Apply filters
    companies = filterCompanies(companies, filters)

    return companies
  }, [searchTerm, filters])

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

  const handleAddToList = () => {
    if (selectedCompanies.length > 0) {
      setShowAddToListDialog(true)
    }
  }

  const handleExport = () => {
    const selectedData = filteredCompanies.filter((c) => selectedCompanies.includes(c.id))
    const csvContent = [
      [
        "Company Name",
        "Industry",
        "Province",
        "Contact Person",
        "Phone",
        "Email",
        "Status",
        "Data Completeness",
        "Last Updated",
      ],
      ...selectedData.map((company) => [
        company.companyNameEn,
        company.industrialName,
        company.province,
        company.contactPersons[0]?.name || "",
        company.contactPersons[0]?.phone || "",
        company.contactPersons[0]?.email || "",
        company.verificationStatus,
        `${company.dataCompleteness}%`,
        company.lastUpdated,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `selly-base-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setShowCompanyDetail(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Lookup</h1>
          <p className="text-gray-600">Search and discover companies in our database</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Companies</TabsTrigger>
            <TabsTrigger value="lists">My Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search Section */}
            <CompanySearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={() => setSearchTerm("")}
            />

            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <CompanyFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

              <div className="flex gap-2">
                <button
                  onClick={handleAddToList}
                  disabled={selectedCompanies.length === 0}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                >
                  Add to List ({selectedCompanies.length})
                </button>
                <button
                  onClick={handleExport}
                  disabled={selectedCompanies.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export ({selectedCompanies.length})
                </button>
              </div>
            </div>

            {/* Results Table */}
            <CompanyTable
              companies={filteredCompanies}
              selectedCompanies={selectedCompanies}
              onSelectCompany={handleSelectCompany}
              onSelectAll={handleSelectAll}
              onViewCompany={handleViewCompany}
            />

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
              Showing {filteredCompanies.length} of {mockCompanies.length} companies
            </div>
          </TabsContent>

          <TabsContent value="lists">
            <div className="text-center py-12">
              <p className="text-gray-500">My Lists functionality will be available in the List Management section.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add to List Dialog */}
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          selectedCompanyIds={selectedCompanies}
          onSuccess={() => {
            setSelectedCompanies([])
            setShowAddToListDialog(false)
          }}
        />

        {/* Company Detail Drawer */}
        <CompanyDetailDrawer
          company={selectedCompany}
          open={showCompanyDetail}
          onOpenChange={setShowCompanyDetail}
        />
      </main>
    </div>
  )
}

export default requireAuth(["user", "admin"])(CompanyLookupPage)
