"use client"

import type { Company, LeadScore } from "@/lib/types"
import type { WeightedLeadScore } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowUpDown, Eye } from "lucide-react"

interface ListTableProps {
  companies: Company[]
  selectedCompanies: string[]
  onSelectCompany: (companyId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  showLeadScores?: boolean
  leadScores?: { [companyId: string]: WeightedLeadScore }
  onViewCompany?: (company: Company) => void
  sortable?: boolean
}

export function ListTable({
  companies,
  selectedCompanies,
  onSelectCompany,
  onSelectAll,
  showLeadScores = false,
  leadScores = {},
  onViewCompany,
  sortable = false,
}: ListTableProps) {
  const allSelected = companies.length > 0 && selectedCompanies.length === companies.length
  const someSelected = selectedCompanies.length > 0 && selectedCompanies.length < companies.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Needs Verification":
        return "bg-yellow-100 text-yellow-800"
      case "Invalid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getLeadScore = (companyId: string) => {
    return leadScores[companyId]
  }

  const getMatchingSummary = (companyId: string) => {
    const score = getLeadScore(companyId)
    if (!score) return null

    const { matchingSummary } = score
    const matches = []
    
    if (matchingSummary.keyword) matches.push({ label: "Keyword", score: matchingSummary.keywordScore })
    if (matchingSummary.industrial) matches.push({ label: "Industry", score: matchingSummary.industrialScore })
    if (matchingSummary.province) matches.push({ label: "Province", score: matchingSummary.provinceScore })
    if (matchingSummary.companySize) matches.push({ label: "Size", score: matchingSummary.companySizeScore })
    if (matchingSummary.contactStatus) matches.push({ label: "Status", score: matchingSummary.contactStatusScore })

    return (
      <div className="flex gap-1 mt-1 flex-wrap">
        {matches.length > 0 ? (
          matches.slice(0, 3).map((match, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700"
            >
              <Check className="h-3 w-3" />
              {match.label}: {match.score}%
            </div>
          ))
        ) : (
          <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500">
            No matches
          </div>
        )}
        {matches.length > 3 && (
          <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
            +{matches.length - 3} more
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
              />
            </TableHead>
            {showLeadScores && (
              <TableHead>
                <div className="flex items-center gap-1">
                  Weighted Score
                  {sortable && <ArrowUpDown className="h-4 w-4" />}
                </div>
              </TableHead>
            )}
            <TableHead>Company Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Completeness</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const leadScore = getLeadScore(company.id)
            return (
              <TableRow key={company.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={(checked) => onSelectCompany(company.id, checked as boolean)}
                  />
                </TableCell>
                {showLeadScores && (
                  <TableCell>
                    <div>
                      <div className="font-bold text-lg text-primary">
                        {leadScore?.normalizedScore || 0}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {leadScore ? `${leadScore.score}/${leadScore.maxPossibleScore}` : '0/0'}
                      </div>
                      {getMatchingSummary(company.id)}
                    </div>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <button 
                    className="text-left hover:text-blue-600 transition-colors"
                    onClick={() => onViewCompany?.(company)}
                  >
                    <div className="font-semibold hover:underline cursor-pointer">{company.companyNameEn}</div>
                    {company.registeredNo && <div className="text-sm text-gray-500">Reg: {company.registeredNo}</div>}
                  </button>
                </TableCell>
                <TableCell>{company.industrialName}</TableCell>
                <TableCell>{company.province}</TableCell>
                <TableCell>
                  {company.contactPersons.length > 0 ? (
                    <div>
                      <div className="font-medium">{company.contactPersons[0].name}</div>
                      {company.contactPersons[0].phone && (
                        <div className="text-sm text-gray-500">{company.contactPersons[0].phone}</div>
                      )}
                      {company.contactPersons[0].email && (
                        <div className="text-sm text-gray-500">{company.contactPersons[0].email}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No contact info</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(company.verificationStatus)}>{company.verificationStatus}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getCompletenessColor(company.dataCompleteness)}`}>
                    {company.dataCompleteness}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{company.lastUpdated}</TableCell>
                <TableCell className="text-sm text-gray-500">{company.createdBy}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewCompany?.(company)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {companies.length === 0 && <div className="text-center py-12 text-gray-500">No companies in this list.</div>}
    </div>
  )
}
