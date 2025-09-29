"use client"
import type { Company } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, X, Edit, MoreHorizontal } from "lucide-react"

interface StaffTableProps {
  companies: Company[]
  selectedCompanies: string[]
  onSelectCompany: (companyId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onApprove: (companyId: string) => void
  onReject: (companyId: string, reason: string) => void
  onEdit: (company: Company) => void
}

export function StaffTable({
  companies,
  selectedCompanies,
  onSelectCompany,
  onSelectAll,
  onApprove,
  onReject,
  onEdit,
}: StaffTableProps) {
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

  const handleReject = (companyId: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      onReject(companyId, reason)
    }
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
            <TableHead>Company Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Data Completeness</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCompanies.includes(company.id)}
                  onCheckedChange={(checked) => onSelectCompany(company.id, checked as boolean)}
                />
              </TableCell>
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
              <TableCell>
                <div className="flex items-center gap-1">
                  {company.verificationStatus === "Needs Verification" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove(company.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(company.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(company)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Record
                      </DropdownMenuItem>
                      {company.verificationStatus !== "Active" && (
                        <DropdownMenuItem onClick={() => onApprove(company.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {company.verificationStatus !== "Invalid" && (
                        <DropdownMenuItem onClick={() => handleReject(company.id)}>
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {companies.length === 0 && (
        <div className="text-center py-12 text-gray-500">No companies found matching your criteria.</div>
      )}
    </div>
  )
}
