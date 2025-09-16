"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { ListSelector } from "@/components/list-selector"
import { ListTable } from "@/components/list-table"
import { LeadScoringPanel } from "@/components/lead-scoring-panel"
import { mockCompanies, mockUserLists, calculateLeadScore } from "@/lib/mock-data"
import { requireAuth } from "@/lib/auth"
import type { FilterOptions, LeadScore } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function ListManagementPage() {
  const [selectedListId, setSelectedListId] = useState<string>(mockUserLists[0]?.id || "")
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showLeadScoring, setShowLeadScoring] = useState(false)
  const [scoringCriteria, setScoringCriteria] = useState<FilterOptions>({})
  const [leadScores, setLeadScores] = useState<LeadScore[]>([])

  // Get companies in the selected list
  const selectedList = mockUserLists.find((list) => list.id === selectedListId)
  const listCompanies = useMemo(() => {
    if (!selectedList) return []
    return mockCompanies.filter((company) => selectedList.companyIds.includes(company.id))
  }, [selectedList])

  // Apply lead scoring if active
  const displayCompanies = useMemo(() => {
    if (!showLeadScoring || Object.keys(scoringCriteria).length === 0) {
      return listCompanies
    }

    // Calculate scores for all companies
    const scores = listCompanies.map((company) => calculateLeadScore(company, scoringCriteria))
    setLeadScores(scores)

    // Sort by score descending
    return listCompanies.sort((a, b) => {
      const scoreA = scores.find((s) => s.companyId === a.id)?.score || 0
      const scoreB = scores.find((s) => s.companyId === b.id)?.score || 0
      return scoreB - scoreA
    })
  }, [listCompanies, showLeadScoring, scoringCriteria])

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

  const handleRemoveFromList = () => {
    // Simulate removing companies from list
    console.log("Removing companies from list:", selectedCompanies)
    setSelectedCompanies([])
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

  const handleApplyScoring = (criteria: FilterOptions) => {
    setScoringCriteria(criteria)
    setShowLeadScoring(true)
  }

  const handleClearScoring = () => {
    setShowLeadScoring(false)
    setScoringCriteria({})
    setLeadScores([])
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
            <ListSelector lists={mockUserLists} selectedListId={selectedListId} onSelectList={setSelectedListId} />
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

                {/* Lead Scoring Panel */}
                <LeadScoringPanel
                  isActive={showLeadScoring}
                  criteria={scoringCriteria}
                  onApplyScoring={handleApplyScoring}
                  onClearScoring={handleClearScoring}
                />

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

                  {showLeadScoring && <div className="text-sm text-gray-600">Sorted by lead score (highest first)</div>}
                </div>

                {/* Companies Table */}
                <ListTable
                  companies={displayCompanies}
                  selectedCompanies={selectedCompanies}
                  onSelectCompany={handleSelectCompany}
                  onSelectAll={handleSelectAll}
                  showLeadScores={showLeadScoring}
                  leadScores={leadScores}
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
      </main>
    </div>
  )
}

export default requireAuth(["user", "admin"])(ListManagementPage)
