"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { CompanySearch } from "@/components/company-search"
import { CompanyTable } from "@/components/company-table"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { SmartFilteringPanel, type SmartFilteringCriteria } from "@/components/smart-filtering-panel"
import { mockCompanies, searchAndScoreCompanies, type WeightedLeadScore } from "@/lib/mock-data"
import { requireAuth } from "@/lib/auth"
import type { Company } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"

function CompanyLookupPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [smartFiltering, setSmartFiltering] = useState<SmartFilteringCriteria>({})
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showAddToListDialog, setShowAddToListDialog] = useState(false)
  const [showSmartFilteringDialog, setShowSmartFilteringDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyDetail, setShowCompanyDetail] = useState(false)
  const [hasAppliedFiltering, setHasAppliedFiltering] = useState(false)

  // Process companies with smart filtering and scoring
  const { filteredCompanies, leadScores } = useMemo(() => {
    // Only process companies if smart filtering has been applied
    if (!hasAppliedFiltering) {
      return { filteredCompanies: [], leadScores: {} }
    }

    const scoredResults = searchAndScoreCompanies(mockCompanies, smartFiltering)
    const companies = scoredResults.map(result => result.company)
    const scores: { [key: string]: WeightedLeadScore } = {}
    
    scoredResults.forEach(result => {
      scores[result.company.id] = result.score
    })

    return { 
      filteredCompanies: companies,
      leadScores: scores 
    }
  }, [smartFiltering, hasAppliedFiltering])

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

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      // Open smart filtering with keyword pre-filled
      setSmartFiltering(prev => ({
        ...prev,
        keyword: searchTerm,
      }))
      setShowSmartFilteringDialog(true)
    }
  }

  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria)
    setHasAppliedFiltering(true)
    setSelectedCompanies([]) // Clear selections when applying new filters
  }

  const handleClearSmartFiltering = () => {
    setSmartFiltering({})
    setHasAppliedFiltering(false)
    setSearchTerm("")
    setSelectedCompanies([])
  }

  const clearFilters = () => {
    handleClearSmartFiltering()
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
              onSearchSubmit={handleSearchSubmit}
              onOpenSmartFiltering={() => setShowSmartFilteringDialog(true)}
            />

            {/* Show default message or results */}
            {!hasAppliedFiltering ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Search className="h-16 w-16 text-gray-300 mx-auto" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Ready to Find Companies?
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Please put the keyword in the search box to filter and show the data.
                        Use Smart Filtering to apply weighted lead scoring and find the best matches.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Search className="h-4 w-4" />
                        <span>Search by keyword then press Enter</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>Or click Smart Filtering to configure</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Filters and Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {hasAppliedFiltering && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Filter className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">
                          Smart Filtering Applied
                        </span>
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-800 text-sm underline ml-2"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

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
                  showLeadScores={true}
                  leadScores={leadScores}
                  sortable={true}
                />

                {/* Results Summary */}
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>Showing {filteredCompanies.length} companies with weighted lead scores</span>
                  {filteredCompanies.length > 0 && leadScores[filteredCompanies[0]?.id] && (
                    <span className="text-blue-600">
                      Sorted by: Highest weighted score first
                    </span>
                  )}
                </div>
              </>
            )}
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

        {/* Smart Filtering Dialog */}
        <SmartFilteringPanel
          isOpen={showSmartFilteringDialog}
          onOpenChange={setShowSmartFilteringDialog}
          criteria={smartFiltering}
          onApplyFiltering={handleApplySmartFiltering}
          onClearFiltering={handleClearSmartFiltering}
          initialKeyword={searchTerm}
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
