"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { CompanySearch } from "@/components/company-search"
import { CompanyTable } from "@/components/company-table"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { SmartFilteringPanel, type SmartFilteringCriteria } from "@/components/smart-filtering-panel"
import { requireAuth } from "@/lib/auth"
import { useCompaniesSearch } from "@/lib/hooks/api-hooks"
import { searchAndScoreCompanies, type WeightedLeadScore } from "@/lib/mock-data"
import type { Company } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Loader2 } from "lucide-react"

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
  const [isSimpleSearch, setIsSimpleSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Convert smartFiltering criteria to API search filters
  const apiSearchFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 25,
    };

    if (isSimpleSearch) {

      if(searchTerm.trim()){
        filters.q = searchTerm.trim() || "";
        filters.includeSharedData = false;
      }
    }

    if (hasAppliedFiltering) {
      // Convert smart filtering criteria to API filters
      if (smartFiltering.province) {
        filters.province = smartFiltering.province;
      }
      if (smartFiltering.companySize && smartFiltering.companySize.length > 0) {
        filters.companySize = smartFiltering.companySize;
      }
      if (smartFiltering.dataSource && smartFiltering.dataSource.length > 0) {
        filters.dataSource = smartFiltering.dataSource;
      }
      if (smartFiltering.verificationStatus) {
        filters.verificationStatus = smartFiltering.verificationStatus;
      }
      if (smartFiltering.dataSensitivity && smartFiltering.dataSensitivity.length > 0) {
        filters.dataSensitivity = smartFiltering.dataSensitivity;
      }
      // Include search term even with smart filtering
      if (searchTerm.trim()) {
        filters.q = searchTerm.trim();
      }
    }

    return filters;
  }, [searchTerm, smartFiltering, hasAppliedFiltering, isSimpleSearch, currentPage]);

  // Use API search when we have search criteria, otherwise don't query
  const shouldSearch = isSimpleSearch && searchTerm.trim() || hasAppliedFiltering;
  const { 
    data: apiSearchResult, 
    isLoading: isApiLoading, 
    error: apiError,
    isError: hasApiError 
  } = useCompaniesSearch(shouldSearch ? apiSearchFilters : {});

  // Process companies with either API results or fallback to mock data
  const { filteredCompanies, leadScores, isLoading } = useMemo(() => {
    // If API is loading, show loading state
    if (shouldSearch && isApiLoading) {
      return { filteredCompanies: [], leadScores: {}, isLoading: true };
    }

    // If API has results, use them
    if (shouldSearch && apiSearchResult && !hasApiError) {
      // Convert API results to expected format
      const companies = apiSearchResult.items.map((item: any) => ({
        id: item.id,
        companyNameEn: item.displayName || item.companyNameEn,
        companyNameTh: item.companyNameTh || '',
        registrationId: item.registrationId || '',
        industrialName: item.industry || 'Unknown',
        province: item.province || '',
        websiteUrl: item.websiteUrl || '',
        primaryEmail: item.primaryEmail || '',
        primaryPhone: item.primaryPhone || '',
        dataSource: item.dataSource || 'api',
        verificationStatus: item.verificationStatus || 'unverified',
        qualityScore: item.qualityScore || 0,
        contactPersons: item.contactPersons || [],
        companySize: item.companySize || 'unknown',
        businessDescription: item.businessDescription || '',
        dataSensitivity: item.dataSensitivity || 'standard',
        isSharedData: item.isSharedData || false,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

      return { filteredCompanies: companies, leadScores: {}, isLoading: false };
    }

    // If API failed or no results, show empty state
    if (hasApiError) {
      console.error('API search failed, no fallback data available');
    }
    
    // No results when nothing is applied or API failed
    return { filteredCompanies: [], leadScores: {}, isLoading: false };
  }, [searchTerm, smartFiltering, hasAppliedFiltering, isSimpleSearch, apiSearchResult, isApiLoading, hasApiError, shouldSearch]);

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
      setIsSimpleSearch(true)
      setHasAppliedFiltering(false)
      setSelectedCompanies([])
    }
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    // Clear simple search when search term is cleared
    if (!term.trim()) {
      setIsSimpleSearch(false)
    }
  }

  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria)
    setHasAppliedFiltering(true)
    setIsSimpleSearch(false) // Switch to smart filtering mode
    setSelectedCompanies([])
  }

  const handleClearSmartFiltering = () => {
    setSmartFiltering({})
    setHasAppliedFiltering(false)
    setIsSimpleSearch(false)
    setSearchTerm("")
    setSelectedCompanies([])
  }

  const clearFilters = () => {
    handleClearSmartFiltering()
  }

  const hasResults = isSimpleSearch || hasAppliedFiltering

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
          {/* <TabsList>
            <TabsTrigger value="all">All Companies</TabsTrigger>
          </TabsList> */}
          <h3 className="font-medium mb-2 mt-2">All Companies</h3>

          <TabsContent value="all" className="space-y-6">
            {/* Search Section */}
            <CompanySearch
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onClearSearch={() => {
                setSearchTerm("")
                setIsSimpleSearch(false)
              }}
              onSearchSubmit={handleSearchSubmit}
              onOpenSmartFiltering={() => setShowSmartFilteringDialog(true)}
            />

            {/* Show default message or results */}
            {!hasResults ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Search className="h-16 w-16 text-gray-300 mx-auto" />
                    <div className="flex flex-col items-center">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Ready to Find Companies?
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Enter keywords in the search box and press Enter for instant results,
                        or use Smart Filtering for advanced weighted scoring.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Search className="h-4 w-4" />
                        <span>Quick search: Enter keywords and press Enter</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>Advanced: Use Smart Filtering for lead scoring</span>
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
                    {isSimpleSearch && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          Search: "{searchTerm}"
                        </span>
                        <button
                          onClick={clearFilters}
                          className="text-green-600 hover:text-green-800 text-sm underline ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    )}
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
                    {/* API Status Indicator */}
                    {hasApiError && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-sm text-yellow-800">
                          Using fallback data (API unavailable)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToList}
                      disabled={selectedCompanies.length === 0 || isLoading}
                      className="px-3 py-2 bg-primary text-sm text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                    >
                      Add to List ({selectedCompanies.length})
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={selectedCompanies.length === 0}
                      className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Export ({selectedCompanies.length})
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                {isLoading ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                      <p className="text-gray-600">Searching companies...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <CompanyTable
                    companies={filteredCompanies}
                    selectedCompanies={selectedCompanies}
                    onSelectCompany={handleSelectCompany}
                    onSelectAll={handleSelectAll}
                    onViewCompany={handleViewCompany}
                    showLeadScores={hasAppliedFiltering}
                    leadScores={leadScores}
                    sortable={true}
                  />
                )}

                {/* Results Summary */}
                {!isLoading && (
                  <div className="text-sm text-gray-600 flex justify-between">
                    {isSimpleSearch ? (
                      <span>Showing {filteredCompanies.length} companies matching "{searchTerm}"</span>
                    ) : (
                      <span>Showing {filteredCompanies.length} companies with weighted lead scores</span>
                    )}
                    {filteredCompanies.length > 0 && leadScores[filteredCompanies[0]?.id] && (
                      <span className="text-blue-600">
                        Sorted by: Highest weighted score first
                      </span>
                    )}
                    {/* {apiSearchResult && (
                      <span className="text-green-600">
                        API Results: Page {apiSearchResult.page} of {Math.ceil(apiSearchResult.total / apiSearchResult.limit)}
                      </span>
                    )} */}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="lists">
            <div className="text-center py-12">
              <p className="text-gray-500">My Lists functionality will be available in the List Management section.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add to List Dialog - Updated to refresh data */}
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          selectedCompanyIds={selectedCompanies}
          onSuccess={() => {
            setSelectedCompanies([])
            setShowAddToListDialog(false)
            // Trigger refresh of any related data
            console.log("Companies successfully added to list")
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

export default requireAuth(["companies:read", "*"])(CompanyLookupPage)
