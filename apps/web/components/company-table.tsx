"use client"
import type { Company } from "@/lib/mock-data"
import type { WeightedLeadScore } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useState } from "react"

interface CompanyTableProps {
  companies: Company[]
  selectedCompanies: string[]
  onSelectCompany: (companyId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onViewCompany?: (company: Company) => void
  showLeadScores?: boolean
  leadScores?: { [companyId: string]: WeightedLeadScore }
  sortable?: boolean
}

type SortField = 'name' | 'industry' | 'province' | 'status' | 'completeness' | 'score'
type SortDirection = 'asc' | 'desc'

export function CompanyTable({ 
  companies, 
  selectedCompanies, 
  onSelectCompany, 
  onSelectAll, 
  onViewCompany,
  showLeadScores = false,
  leadScores = {},
  sortable = false
}: CompanyTableProps) {
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const allSelected = companies.length > 0 && selectedCompanies.length === companies.length
  const someSelected = selectedCompanies.length > 0 && selectedCompanies.length < companies.length

  const handleSort = (field: SortField) => {
    if (!sortable) return
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'score' ? 'desc' : 'asc')
    }
  }

  const sortedCompanies = sortable ? [...companies].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'name':
        aValue = a.companyNameEn.toLowerCase()
        bValue = b.companyNameEn.toLowerCase()
        break
      case 'industry':
        aValue = a.industrialName.toLowerCase()
        bValue = b.industrialName.toLowerCase()
        break
      case 'province':
        aValue = a.province.toLowerCase()
        bValue = b.province.toLowerCase()
        break
      case 'status':
        aValue = a.verificationStatus.toLowerCase()
        bValue = b.verificationStatus.toLowerCase()
        break
      case 'completeness':
        aValue = a.dataCompleteness
        bValue = b.dataCompleteness
        break
      case 'score':
        aValue = leadScores[a.id]?.normalizedScore || 0
        bValue = leadScores[b.id]?.normalizedScore || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  }) : companies

  const getSortIcon = (field: SortField) => {
    if (!sortable || sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-300" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "font-bold bg-green-100 text-green-800"
      case "unverified":
        return "font-bold bg-red-100 text-red-800"
      default:
        return "font-bold bg-gray-100 text-gray-800"
    }
  }

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
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
                  if (el && el instanceof HTMLInputElement) {
                    el.indeterminate = someSelected
                  }
                }}
              />
            </TableHead>
            <TableHead 
              className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Company Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => handleSort('industry')}
            >
              <div className="flex items-center">
                Industry
                {getSortIcon('industry')}
              </div>
            </TableHead>
            <TableHead 
              className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => handleSort('province')}
            >
              <div className="flex items-center">
                Province
                {getSortIcon('province')}
              </div>
            </TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead 
              className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={() => handleSort('completeness')}
            >
              <div className="flex items-center">
                Data Completeness
                {getSortIcon('completeness')}
              </div>
            </TableHead>
            {showLeadScores && (
              <TableHead 
                className={sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  Weighted Score
                  {getSortIcon('score')}
                </div>
              </TableHead>
            )}
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompanies.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={showLeadScores ? 9 : 8} 
                className="text-center py-12 text-gray-500"
              >
                No companies match your search criteria
              </TableCell>
            </TableRow>
          ) : (
            sortedCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={(checked) => onSelectCompany(company.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <button 
                    className="text-left hover:text-blue-600 transition-colors"
                    onClick={() => onViewCompany?.(company)}
                  >
                    <div className="font-semibold hover:underline cursor-pointer">{company.companyNameEn}</div>
                    {company.registeredNo && <div className="text-sm text-gray-500">Reg: {company.registeredNo}</div>}
                  </button>
                </TableCell>
                <TableCell>
                  {Array.isArray(company.industrialName) ? (
                    company.industrialName.join(', ')
                  ) : (
                    company.industrialName
                  )}
                </TableCell>
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
                  <Badge className={getStatusColor(company.verificationStatus)}>
                    {company.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getCompletenessColor(company.dataCompleteness)}`}>
                    {company.dataCompleteness}%
                  </span>
                </TableCell>
                {showLeadScores && (
                  <TableCell>
                    {leadScores[company.id] ? (
                      <div>
                        <div className="font-semibold text-lg">
                          {leadScores[company.id].normalizedScore}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {leadScores[company.id].score}/{leadScores[company.id].maxPossibleScore}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                )}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
