"use client"

import { useState, useMemo, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ListSelector } from "@/components/list-selector"
import { ListTable } from "@/components/list-table"
import { SmartFilteringPanel, type SmartFilteringCriteria } from "@/components/smart-filtering-panel"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { searchAndScoreCompanies, removeCompaniesFromList, type WeightedLeadScore } from "@/lib/mock-data"
import { requireAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, Target } from "lucide-react"

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

  // Fetch user lists from backend
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getCompanyLists()
        if (response.data) {
          setUserLists(response.data)
          if (response.data.length > 0 && !selectedListId) {
            setSelectedListId(response.data[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch company lists:', error)
        setUserLists([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLists()
  }, [refreshKey])

  // Fetch companies for selected list
  useEffect(() => {
    const fetchListCompanies = async () => {
      if (!selectedListId) {
        setListCompanies([])
        return
      }

      try {
        const response = await apiClient.getCompanyListItems(selectedListId)
        setListCompanies(response || [])
      } catch (error) {
        console.error('Failed to fetch list companies:', error)
        setListCompanies([])
      }
    }

    fetchListCompanies()
  }, [selectedListId, refreshKey])

  // Get selected list details
  const selectedList = userLists.find((list) => list.id === selectedListId)

  // Apply smart filtering if active
  const { displayCompanies, leadScores } = useMemo(() => {
    if (!showSmartFiltering || Object.keys(smartFiltering).length === 0) {
      return { 
        displayCompanies: listCompanies, 
        leadScores: {} as { [key: string]: WeightedLeadScore }
      }
    }

    // Calculate weighted scores for companies in the list
    const scoredResults = searchAndScoreCompanies(listCompanies, smartFiltering)
    const companies = scoredResults.map(result => result.company)
    const scores: { [key: string]: WeightedLeadScore } = {}
    
    scoredResults.forEach(result => {
      scores[result.company.id] = result.score
    })

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
      setSelectedCompanies(displayCompanies.map((c) => c.id))
    } else {
      setSelectedCompanies([])
    }
  }

  const handleRemoveFromList = async () => {
    if (selectedList && selectedCompanies.length > 0) {
      try {
        await apiClient.removeCompaniesFromList(selectedList.id, selectedCompanies)
        
        // Refresh the data
        setRefreshKey(prev => prev + 1)
        setSelectedCompanies([])
        
        alert(`Removed ${selectedCompanies.length} companies from list.`)
      } catch (error) {
        console.error("Error removing companies:", error)
        alert("Error removing companies from list.")
      }
    }
  }

  const handleExportList = () => {
    const exportData = displayCompanies.filter((c) => selectedCompanies.includes(c.id))
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
        "Lead Score",
      ],
      ...exportData.map((company) => {
        const score = leadScores.find((s) => s.companyId === company.id)?.score || 0
        return [
          company.companyNameEn,
          company.industrialName,
          company.province,
          company.contactPersons[0]?.name || "",
          company.contactPersons[0]?.phone || "",
          company.contactPersons[0]?.email || "",
          company.verificationStatus,
          `${company.dataCompleteness}%`,
          showLeadScoring ? score.toString() : "N/A",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Management</h1>
          <p className="text-gray-600">Manage your saved company lists and apply smart filtering</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* List Selector Sidebar */}
          <div className="lg:col-span-1">
            <ListSelector 
              lists={userLists} 
              selectedListId={selectedListId} 
              onSelectList={setSelectedListId}
              onListsUpdate={() => setRefreshKey(prev => prev + 1)}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedList ? (
              <>
                {/* List Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedList.name}</span>
                      <span className="text-sm font-normal text-gray-500">{listCompanies.length} companies</span>
                    </CardTitle>
                    <CardDescription>
                      Created on {selectedList.createdAt} • Status: {selectedList.status}
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
                    <Button variant="outline" onClick={handleExportList} disabled={selectedCompanies.length === 0}>
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
                  companies={displayCompanies}
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
        />
      </main>
    </div>
  )
}

export default requireAuth(["user", "admin"])(ListManagementPage)
