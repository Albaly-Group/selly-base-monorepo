"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { ListSelector } from "@/components/list-selector"
import { ListTable } from "@/components/list-table"
import { SmartFilteringPanel, type SmartFilteringCriteria } from "@/components/smart-filtering-panel"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { searchAndScoreCompanies, type WeightedLeadScore } from "@/lib/types"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Filter, Target, Loader2, CheckCircle, X } from "lucide-react"

interface CompanyList {
  id: string
  name: string
  companyIds: string[]
  createdAt: string
  status: "Active" | "Inactive"
  owner: string
}

function ListManagementPage() {
  const [userLists, setUserLists] = useState<CompanyList[]>([])
  const [listCompanies, setListCompanies] = useState<Company[]>([])
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showSmartFiltering, setShowSmartFiltering] = useState(false)
  const [showSmartFilteringDialog, setShowSmartFilteringDialog] = useState(false)
  const [smartFiltering, setSmartFiltering] = useState<SmartFilteringCriteria>({})
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyDetail, setShowCompanyDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
    show: boolean
  } | null>(null)

  // Function to show notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true })
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, show: false } : null)
      // Remove notification completely after fade animation
      setTimeout(() => setNotification(null), 300)
    }, 3000)
  }, [])

  // Function to hide notification immediately
  const hideNotification = useCallback(() => {
    setNotification(prev => prev ? { ...prev, show: false } : null)
    setTimeout(() => setNotification(null), 300)
  }, [])

  // Function to refresh data - unified approach like lookup page
  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1)
    // Clear selections when refreshing
    setSelectedCompanies([])
  }, [])

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true)
        setIsRefreshing(true)
        const response = await apiClient.getCompanyLists()

        if (response && response.data && Array.isArray(response.data)) {
          const normalizedLists = response.data.map((list: any) => ({
            ...list,
            companyListItems: list.companyIds || [],
            totalCompanyCount: (list.companyIds || []).length
          }))
          console.log('Normalized lists:', normalizedLists)
          setUserLists(normalizedLists)
          
          if (normalizedLists.length > 0 && !selectedListId) {
            setSelectedListId(normalizedLists[0].id)
          }
        } else {
          console.warn('Unexpected response format from getCompanyLists:', response)
          setUserLists([])
        }
      } catch (error) {
        console.error('Failed to fetch company lists:', error)
        setUserLists([])
        showNotification('error', 'Failed to load company lists. Please refresh the page.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchLists()
  }, [refreshKey, selectedListId])

  useEffect(() => {
    const fetchListCompanies = async () => {
      if (!selectedListId) {
        setListCompanies([])
        return
      }

      try {
        setIsRefreshing(true)
        const response = await apiClient.getCompanyListItems(selectedListId)
        console.log('Fetched list items:', response);
        
        const items = Array.isArray(response) ? response : []
        const rawCompanies = items
          .map((item: any) => item?.company)
          .filter((company) => company != null)
        
        // Normalize company data to match the same format as lookup page
        const normalizedCompanies = rawCompanies.map((item: any) => {
          // Handle industry_classification which can be JSONB array or object
          let industrialName = 'N/A';
          if (item.industryClassification) {
            if (Array.isArray(item.industryClassification)) {
              industrialName = item.industryClassification[0] || 'N/A';
            } else if (typeof item.industryClassification === 'object' && item.industryClassification.name) {
              industrialName = item.industryClassification.name;
            } else if (typeof item.industryClassification === 'string') {
              industrialName = item.industryClassification;
            }
          }

          // Calculate data completeness percentage from quality score (0.0-1.0 to 0-100)
          const qualityScore = parseFloat(item.dataQualityScore) || 0;
          const dataCompleteness = Math.round(qualityScore * 100);

          return {
            id: item.id,
            organizationId: item.organizationId,
            companyNameEn: item.nameEn || item.companyNameEn,
            companyNameTh: item.nameTh || item.companyNameTh,
            companyNameLocal: item.nameLocal || item.companyNameLocal,
            displayName: item.displayName,
            nameEn: item.nameEn || item.companyNameEn, // For list-table compatibility
            primaryRegistrationNo: item.primaryRegistrationNo,
            registrationId: item.registrationId || item.primaryRegistrationNo,
            registeredNo: item.primaryRegistrationNo,
            registrationDate: item.establishedDate,
            industrialName: industrialName,
            province: item.province || 'N/A',
            websiteUrl: item.websiteUrl,
            primaryEmail: item.primaryEmail,
            primaryPhone: item.primaryPhone,
            address1: item.addressLine1,
            address2: item.addressLine2,
            district: item.district, 
            employeeCountEstimate: item.employeeCountEstimate || 0,
            dataSource: item.dataSource,
            verificationStatus: item.verificationStatus || 'unverified',
            qualityScore: qualityScore,
            contactPersons: item.companyContacts || item.contactPersons || [],
            companySize: item.companySize,
            businessDescription: item.businessDescription,
            dataQualityScore: qualityScore,
            dataSensitivity: item.dataSensitivity,
            dataCompleteness: dataCompleteness,
            isSharedData: item.isSharedData,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdBy: item.createdBy,
            lastUpdated: item.updatedAt,
          } as any; // Use 'as any' to bypass strict type checking for mixed type compatibility
        });
        
        console.log('Normalized companies:', normalizedCompanies);
        setListCompanies(normalizedCompanies)
        
        // Don't update the count in ListSelector - keep it fixed to show total items in list
        // Only store the actual loaded companies count separately if needed for the main content
      } catch (error) {
        console.error('Failed to fetch list companies:', error)
        setListCompanies([])
        showNotification('error', 'Failed to load companies from the selected list. Please try again.')
      } finally {
        setIsRefreshing(false)
      }
    }

    fetchListCompanies()
  }, [selectedListId, refreshKey])

  const selectedList = userLists.find((list) => list.id === selectedListId)

  const { displayCompanies, leadScores } = useMemo(() => {
    // Ensure listCompanies is always an array
    const safeListCompanies = Array.isArray(listCompanies) ? listCompanies : []
    
    if (!showSmartFiltering || Object.keys(smartFiltering).length === 0) {
      return { 
        displayCompanies: safeListCompanies, 
        leadScores: {} as { [key: string]: WeightedLeadScore }
      }
    }

    const scoredResults = searchAndScoreCompanies(safeListCompanies as any, smartFiltering)
    const companies = Array.isArray(scoredResults) 
      ? scoredResults.map(result => result.company).filter(Boolean)
      : []
    const scores: { [key: string]: WeightedLeadScore } = {}
    
    if (Array.isArray(scoredResults)) {
      scoredResults.forEach(result => {
        if (result?.company?.id) {
          scores[result.company.id] = result.score
        }
      })
    }

    return {
      displayCompanies: companies,
      leadScores: scores
    }
  }, [listCompanies, showSmartFiltering, smartFiltering])

  const handleSelectCompany = (companyId: string, selected: boolean) => {
    if (selected) {
      setSelectedCompanies((prev) => [...prev, companyId])
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // Ensure displayCompanies is an array before mapping
      if (Array.isArray(displayCompanies)) {
        setSelectedCompanies(displayCompanies.map((c) => c.id))
      }
    } else {
      setSelectedCompanies([])
    }
  }

  const handleRemoveFromList = async () => {
    if (selectedList && selectedCompanies.length > 0) {
      try {
        setIsRemoving(true)
        await apiClient.removeCompaniesFromList(selectedList.id, selectedCompanies)
        
        // Use the unified refresh function instead of setRefreshKey
        refreshData()
        
        // Show success notification
        showNotification('success', `Successfully removed ${selectedCompanies.length} companies from "${selectedList.name}".`)
      } catch (error) {
        console.error("Error removing companies:", error)
        showNotification('error', "Failed to remove companies from list. Please try again.")
      } finally {
        setIsRemoving(false)
      }
    }
  }

  const onExportExcelList = () => {
    // Ensure displayCompanies is an array before filtering
    if (!Array.isArray(displayCompanies)) {
      console.error('displayCompanies is not an array:', displayCompanies)
      showNotification('error', 'Unable to export: No companies data available')
      return
    }
    
    const exportData = displayCompanies.filter((c) => selectedCompanies.includes(c.id))
    const csvContent = [
      [
        "Company Name", "Industry", "Province", "Contact Person", "Phone", "Email", "Status", "Data Completeness", "Lead Score",
      ],
      ...exportData.map((company: any) => {
        const score = leadScores[company.id]?.score || 0
        return [
          company.companyNameEn || company.nameEn,
          company.industrialName,
          company.province,
          company.contactPersons,
          company.primaryPhone,
          company.primaryEmail,
          company.verificationStatus,
          `${company.dataCompleteness}%`,
          showSmartFiltering ? score.toString() : "N/A",
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedList?.name || "list"}-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    // Show success notification for export
    showNotification('success', `Successfully exported ${exportData.length} companies to CSV.`)
  }


  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria)
    setShowSmartFiltering(true)
    setSelectedCompanies([])
  }

  const handleClearSmartFiltering = () => {
    setSmartFiltering({})
    setShowSmartFiltering(false)
    setSelectedCompanies([])
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setShowCompanyDetail(true)
  }

  // Handle company edit/update success - add refresh like lookup page
  const handleCompanyUpdate = useCallback((updatedCompany: Company) => {
    console.log("Company updated successfully:", updatedCompany)
    // Refresh the data to show updated company
    refreshData()
    
    // Show success notification
    showNotification('success', `Successfully updated company "${updatedCompany.companyNameEn || updatedCompany.displayName}".`)
    
    // Close any open dialogs
    setShowCompanyDetail(false)
  }, [refreshData, showNotification])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Management</h1>
          <p className="text-gray-600">Manage your saved company lists and apply smart filtering</p>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 w-96 transition-all duration-300 ease-in-out ${
            notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <Alert className={`${
              notification.type === 'success' 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            } shadow-lg`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <div className="flex items-start justify-between w-full">
                <AlertDescription className={`${
                  notification.type === 'success' 
                    ? 'text-green-800' 
                    : 'text-red-800'
                } text-sm leading-relaxed pr-4`}>
                  {notification.message}
                </AlertDescription>
                <button
                  onClick={hideNotification}
                  className={`${
                    notification.type === 'success' 
                      ? 'text-green-400 hover:text-green-600' 
                      : 'text-red-400 hover:text-red-600'
                  } transition-colors flex-shrink-0`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ListSelector 
              lists={userLists as any} 
              selectedListId={selectedListId} 
              onSelectList={setSelectedListId}
              onListsUpdate={() => refreshData()}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedList ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedList.name}</span>
                      <span className="text-sm font-normal text-gray-500">{displayCompanies.length} companies</span>
                    </CardTitle>
                    <CardDescription>
                      Created on {new Date(selectedList.createdAt).toLocaleDateString()} • Status: {selectedList.status || 'Active'}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Smart Filtering Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Smart Filtering & Lead Scoring
                        {showSmartFiltering && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={showSmartFiltering ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setShowSmartFilteringDialog(true)}
                        >
                          <Filter className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        {showSmartFiltering && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSmartFiltering}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Apply intelligent filtering with weighted lead scoring to rank companies in your list.
                      {showSmartFiltering && ` Showing ${displayCompanies.length} companies sorted by weighted score.`}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Actions Bar */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleRemoveFromList}
                      disabled={selectedCompanies.length === 0}
                    >
                      Remove from List ({selectedCompanies.length})
                    </Button>
                    <Button variant="outline" onClick={onExportExcelList} disabled={selectedCompanies.length === 0}>
                      Export ({selectedCompanies.length})
                    </Button>
                  </div>

                  {showSmartFiltering && (
                    <div className="text-sm text-gray-600">
                      Sorted by weighted score (highest first)
                    </div>
                  )}
                </div>

                {/* Companies Table */}
                <ListTable
                  companies={displayCompanies as any}
                  selectedCompanies={selectedCompanies}
                  onSelectCompany={handleSelectCompany}
                  onSelectAll={handleSelectAll}
                  showLeadScores={showSmartFiltering}
                  leadScores={leadScores}
                  onViewCompany={handleViewCompany}
                  sortable={showSmartFiltering}
                />
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No lists available. Create a list from the Company Lookup page.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Smart Filtering Dialog */}
        <SmartFilteringPanel
          isOpen={showSmartFilteringDialog}
          onOpenChange={setShowSmartFilteringDialog}
          criteria={smartFiltering}
          onApplyFiltering={handleApplySmartFiltering}
          onClearFiltering={handleClearSmartFiltering}
        />

        {/* Company Detail Drawer */}
        <CompanyDetailDrawer
          company={selectedCompany}
          open={showCompanyDetail}
          onOpenChange={setShowCompanyDetail}
          onCompanyUpdated={handleCompanyUpdate}
        />

        {/* Loading overlay during refresh */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-white bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Refreshing data...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default requireAuth(["lists:*", "lists:create", "lists:read", "lists:read:own", "*"])(ListManagementPage)
