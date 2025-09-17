"use client"

import type { Company, LeadScore } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, ArrowUpDown } from "lucide-react"

interface ListTableProps {
  companies: Company[]
  selectedCompanies: string[]
  onSelectCompany: (companyId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  showLeadScores?: boolean
  leadScores?: LeadScore[]
}

export function ListTable({
  companies,
  selectedCompanies,
  onSelectCompany,
  onSelectAll,
  showLeadScores = false,
  leadScores = [],
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
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Archived":
        return "bg-gray-100 text-gray-800"
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
    return leadScores.find((score) => score.companyId === companyId)
  }

  const getMatchingSummary = (companyId: string) => {
    const score = getLeadScore(companyId)
    if (!score) return null

    return (
      <div className="flex gap-1 mt-1">
        {Object.entries(score.matchingSummary).map(([key, matched]) => (
          <div
            key={key}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              matched ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {matched ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {key === "industrial" && "Industry"}
            {key === "province" && "Province"}
            {key === "companySize" && "Size"}
            {key === "contactStatus" && "Status"}
          </div>
        ))}
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
                  Lead Score
                  <ArrowUpDown className="h-4 w-4" />
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
                      <div className="font-bold text-lg text-primary">{leadScore?.score || 0}</div>
                      {getMatchingSummary(company.id)}
                    </div>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{company.companyNameEn}</div>
                    {company.registeredNo && <div className="text-sm text-gray-500">Reg: {company.registeredNo}</div>}
                  </div>
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {companies.length === 0 && <div className="text-center py-12 text-gray-500">No companies in this list.</div>}
    </div>
  )
}
