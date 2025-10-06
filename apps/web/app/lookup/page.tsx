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

  const apiSearchFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 25,
    };

    if (isSimpleSearch) {

      if(searchTerm.trim()){
        filters.q = searchTerm.trim() || "";
        filters.includeSharedData = true;
      }
    }

    if (hasAppliedFiltering) {

      // if (searchTerm.trim()) {
      //   filters.q = searchTerm.trim();
      // }

      if (smartFiltering.keywordWeight) {
        filters.keywordWeight = smartFiltering.keywordWeight; 
      }
      if (smartFiltering.industrial){
        filters.industrial = smartFiltering.industrial;
      }
      if (smartFiltering.province) {
        filters.province = smartFiltering.province;
      }
      if (smartFiltering.companySize && smartFiltering.companySize.length > 0) {
        filters.companySize = smartFiltering.companySize;
      }
      if (smartFiltering.contactStatus){
        filters.contactStatus = smartFiltering.contactStatus;
      }

      // if (smartFiltering.dataSource && smartFiltering.dataSource.length > 0) {
      //   filters.dataSource = smartFiltering.dataSource;
      // }
      // if (smartFiltering.verificationStatus) {
      //   filters.verificationStatus = smartFiltering.verificationStatus;
      // }
      // if (smartFiltering.dataSensitivity && smartFiltering.dataSensitivity.length > 0) {
      //   filters.dataSensitivity = smartFiltering.dataSensitivity;
      // }
    }

    return filters;
  }, [searchTerm, smartFiltering, hasAppliedFiltering, isSimpleSearch, currentPage]);

  const shouldSearch = isSimpleSearch && searchTerm.trim() || hasAppliedFiltering;
  const { data: apiSearchResult, isLoading: isApiLoading, isError: hasApiError } = useCompaniesSearch(shouldSearch ? apiSearchFilters : {});

  const { filteredCompanies, leadScores, isLoading } = useMemo(() => {
    if (shouldSearch && isApiLoading) {
      return { filteredCompanies: [], leadScores: {}, isLoading: true };
    }

    if (shouldSearch && apiSearchResult && !hasApiError) {
      const companies = apiSearchResult.items.map((item: any) => ({
        id: item.id,
        organizationId: item.organizationId,
        companyNameEn: item.nameEn,
        companyNameTh: item.nameTh,
        companyNameLocal: item.nameLocal,
        displayName: item.displayName,
        primaryRegistrationNo: item.primaryRegistrationNo,
        registrationId: item.registrationId,
        registrationDate: item.establishedDate,
        industrialName: item.industryClassification[0],
        province: item.province,
        websiteUrl: item.websiteUrl,
        primaryEmail: item.primaryEmail,
        primaryPhone: item.primaryPhone,
        address1: item.addressLine_1,
        address2: item.addressLine_2,
        district: item.district, 
        employeeCountEstimate: item.employeeCountEstimate || 0,
        dataSource: item.dataSource,
        verificationStatus: item.verificationStatus,
        qualityScore: item.dataQualityScore || 0,
        contactPersons: item.contactPersons || [],
        companySize: item.companySize,
        businessDescription: item.businessDescription,
        dataQualityScore: item.data_quality_score || 0,
        dataSensitivity: item.dataSensitivity,
        dataCompleteness: item.dataQualityScore,
        isSharedData: item.isSharedData,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return { filteredCompanies: companies, leadScores: {}, isLoading: false };
    }

    if (hasApiError) {
      console.error('API search failed, no fallback data available');
    }
    
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

  const onAddToList = () => {
    if (selectedCompanies.length > 0) {
      setShowAddToListDialog(true)
    }
  }

  const onExportExcel = () => {
    const selectedData = filteredCompanies.filter((c) => selectedCompanies.includes(c.id))
    const csvContent = [
      [
        "Company Name", "Industry", "Province", "Contact Person", "Phone", "Email", "Status", "Data Completeness", "Last Updated",
      ],
      ...selectedData.map((company) => [
        company.companyNameEn, 
        company.industrialName,
        company.province,
        company.contactPersons,
        company.primaryPhone,
        company.primaryEmail,
        company.verificationStatus,
        `${company.dataCompleteness}%`,
        new Date(company.updatedAt).toLocaleDateString(),
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

  const onSearch = () => {
    if (searchTerm.trim()) {
      setIsSimpleSearch(true)
      setHasAppliedFiltering(false)
      setSelectedCompanies([])
    }
  }

  const onSearchChangeVal = (text: string) => {
    setSearchTerm(text)
    if (!text.trim()) {
      setIsSimpleSearch(false)
    }
  }

  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria)
    setHasAppliedFiltering(true)
    setIsSimpleSearch(false)
    setSelectedCompanies([])
  }

  const clearFilters = () => {
    setSmartFiltering({})
    setHasAppliedFiltering(false)
    setIsSimpleSearch(false)
    setSearchTerm("")
    setSelectedCompanies([])
  }

  const ViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setShowCompanyDetail(true)
  }

  const hasResults = isSimpleSearch || hasAppliedFiltering

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Lookup</h1>
          <p className="text-gray-600">Search and discover companies in our database</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <h3 className="font-medium mb-2 mt-2">All Companies</h3>

          <TabsContent value="all" className="space-y-6">
            {/* Search Section */}
            <CompanySearch
              searchTerm={searchTerm}
              onSearchChange={onSearchChangeVal}
              onClearSearch={() => {
                setSearchTerm("")
                setIsSimpleSearch(false)
              }}
              onSearchSubmit={onSearch}
              onOpenSmartFiltering={() => setShowSmartFilteringDialog(true)}
            />

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
                      onClick={onAddToList}
                      disabled={selectedCompanies.length === 0 || isLoading}
                      className="px-3 py-2 bg-primary text-sm text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                    >
                      Add to List ({selectedCompanies.length})
                    </button>
                    <button
                      onClick={onExportExcel}
                      disabled={selectedCompanies.length === 0}
                      className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onViewCompany={ViewCompany}
                    showLeadScores={hasAppliedFiltering}
                    leadScores={leadScores}
                    sortable={true}
                />

                {!isLoading && (
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>Showing {filteredCompanies.length} companies matching "{searchTerm}"</span>
                    {filteredCompanies.length > 0 && (
                      <span className="text-blue-600">
                        Sorted by: Highest weighted score first
                      </span>
                    )}
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
          }}
        />

        {/* Smart Filtering Dialog */}
        <SmartFilteringPanel
          isOpen={showSmartFilteringDialog}
          onOpenChange={setShowSmartFilteringDialog}
          criteria={smartFiltering}
          onApplyFiltering={handleApplySmartFiltering}
          onClearFiltering={clearFilters}
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
