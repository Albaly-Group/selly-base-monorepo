"use client"
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('staff.staff_table')
  const allSelected = companies.length > 0 && selectedCompanies.length === companies.length
  const someSelected = selectedCompanies.length > 0 && selectedCompanies.length < companies.length

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "unverified":
        return "bg-yellow-100 text-yellow-800"
      case "disputed":
      case "inactive":
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
    const reason = prompt(t('rejectPrompt'))
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
                  if (el) (el as any).indeterminate = someSelected
                }}
              />
            </TableHead>
            <TableHead>{t('headers.companyName')}</TableHead>
            <TableHead>{t('headers.industry')}</TableHead>
            <TableHead>{t('headers.province')}</TableHead>
            <TableHead>{t('headers.contactPerson')}</TableHead>
            <TableHead>{t('headers.verificationStatus')}</TableHead>
            <TableHead>{t('headers.dataCompleteness')}</TableHead>
            <TableHead>{t('headers.lastUpdated')}</TableHead>
            <TableHead>{t('headers.createdBy')}</TableHead>
            <TableHead className="w-24">{t('headers.actions')}</TableHead>
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
                  {company.registrationId && <div className="text-sm text-gray-500">{t('regPrefix')}: {company.registrationId}</div>}
                </div>
              </TableCell>
              <TableCell>{company.industrialName}</TableCell>
              <TableCell>{company.province}</TableCell>
              <TableCell>
                {company.contactPersons && company.contactPersons.length > 0 ? (
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
                  <span className="text-gray-400">{t('noContactInfo')}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(company.verificationStatus)}>{company.verificationStatus}</Badge>
              </TableCell>
              <TableCell>
                <span className={`font-medium ${getCompletenessColor(company.dataCompleteness ?? 0)}`}>
                  {company.dataCompleteness ?? 0}%
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{company.lastUpdated}</TableCell>
              <TableCell className="text-sm text-gray-500">{company.createdBy}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {company.verificationStatus === "unverified" && (
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
                        {t('actions.edit')}
                      </DropdownMenuItem>
                      {company.verificationStatus !== "verified" && (
                        <DropdownMenuItem onClick={() => onApprove(company.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          {t('actions.approve')}
                        </DropdownMenuItem>
                      )}
                      {company.verificationStatus !== "disputed" && company.verificationStatus !== "inactive" && (
                        <DropdownMenuItem onClick={() => handleReject(company.id)}>
                          <X className="h-4 w-4 mr-2" />
                          {t('actions.reject')}
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
        <div className="text-center py-12 text-gray-500">{t('noCompanies')}</div>
      )}
    </div>
  )
}
