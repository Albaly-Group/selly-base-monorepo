"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { CompanySearch } from "@/components/company-search"
import { CompanyTable } from "@/components/company-table"
import { CompanyFilters } from "@/components/company-filters"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { useToast } from "@/components/ui/toast"
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
  const { addToast, ToastContainer } = useToast()

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
    } else {
      addToast({
        title: "No companies selected",
        description: "Please select at least one company to add to a list.",
        type: "warning"
      })
    }
  }

  const handleExport = () => {
    if (selectedCompanies.length === 0) {
      addToast({
        title: "No companies selected",
        description: "Please select companies to export.",
        type: "warning"
      })
      return
    }

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
    
    addToast({
      title: "Export successful",
      description: `Exported ${selectedCompanies.length} companies to CSV.`,
      type: "success"
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

  const handleCompanyClick = (company: Company) => {
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

            {/* Results Table or Empty State */}
            {filteredCompanies.length > 0 ? (
              <>
                <CompanyTable
                  companies={filteredCompanies}
                  selectedCompanies={selectedCompanies}
                  onSelectCompany={handleSelectCompany}
                  onSelectAll={handleSelectAll}
                  onCompanyClick={handleCompanyClick}
                />

                {/* Results Summary */}
                <div className="text-sm text-gray-600">
                  Showing {filteredCompanies.length} of {mockCompanies.length} companies
                  {selectedCompanies.length > 0 && ` • ${selectedCompanies.length} selected`}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {searchTerm || Object.keys(filters).length > 0 ? (
                    <>
                      <p>Try adjusting your search criteria:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Check your spelling</li>
                        <li>Use broader search terms</li>
                        <li>Remove some filters</li>
                        <li>Search by Registration ID for exact matches</li>
                      </ul>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 underline"
                      >
                        Clear all filters and search
                      </button>
                    </>
                  ) : (
                    <p>Start by searching for companies or applying filters above.</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lists">
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Your Lists</h3>
              <p className="text-gray-600 mb-4">
                Visit the <strong>Lists</strong> section to view and manage your saved company lists with smart filtering and lead scoring.
              </p>
              <button
                onClick={() => window.location.href = '/lists'}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Lists
              </button>
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
            addToast({
              title: "Companies added to list",
              description: `Successfully added ${selectedCompanies.length} companies.`,
              type: "success"
            })
          }}
        />

        {/* Company Detail Drawer */}
        <CompanyDetailDrawer
          company={selectedCompany}
          isOpen={showCompanyDetail}
          onClose={() => setShowCompanyDetail(false)}
        />

        {/* Toast Container */}
        <ToastContainer />
      </main>
    </div>
  )
}

export default requireAuth(["user", "admin"])(CompanyLookupPage)
