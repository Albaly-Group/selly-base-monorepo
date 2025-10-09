"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, AlertTriangle } from "lucide-react"
import { useRemoveCompaniesFromList } from "@/lib/hooks/api-hooks"

interface CompanyListBulkActionsProps {
  listId: string
  companies: Array<{ id: string; name?: string }>
  selectedCompanyIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onRemoved?: () => void
  className?: string
}

export function CompanyListBulkActions({ 
  listId, 
  companies,
  selectedCompanyIds,
  onSelectionChange,
  onRemoved,
  className = ""
}: CompanyListBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const removeCompaniesFromListMutation = useRemoveCompaniesFromList()

  const isAllSelected = companies.length > 0 && selectedCompanyIds.length === companies.length
  const isPartialSelected = selectedCompanyIds.length > 0 && selectedCompanyIds.length < companies.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(companies.map(company => company.id))
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedCompanyIds.length === 0) return

    try {
      await removeCompaniesFromListMutation.mutateAsync({
        listId,
        data: { companyIds: selectedCompanyIds }
      })
      
      setShowDeleteConfirm(false)
      onSelectionChange([]) // Clear selection
      
      if (onRemoved) {
        onRemoved()
      }
    } catch (error) {
      console.error("Failed to remove companies from list:", error)
    }
  }

  const selectedCompanyNames = companies
    .filter(company => selectedCompanyIds.includes(company.id))
    .map(company => company.name || 'Unnamed Company')
    .slice(0, 3) // Show max 3 names

  return (
    <>
      <div className={`flex items-center justify-between gap-4 p-4 bg-gray-50 border rounded-lg ${className}`}>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            disabled={companies.length === 0}
          />
          <span className="text-sm text-gray-700">
            {selectedCompanyIds.length === 0 
              ? `Select all ${companies.length} companies`
              : isPartialSelected 
                ? `${selectedCompanyIds.length} of ${companies.length} selected`
                : `All ${companies.length} companies selected`
            }
          </span>
        </div>

        {selectedCompanyIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={removeCompaniesFromListMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove {selectedCompanyIds.length} {selectedCompanyIds.length === 1 ? 'Company' : 'Companies'}
          </Button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Companies</h3>
            </div>
            
            <div className="text-gray-600 mb-4">
              <p className="mb-2">
                Are you sure you want to remove {selectedCompanyIds.length} 
                {selectedCompanyIds.length === 1 ? ' company' : ' companies'} from this list?
              </p>
              
              {selectedCompanyNames.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium">Companies to remove:</p>
                  <ul className="mt-1 space-y-1">
                    {selectedCompanyNames.map((name, index) => (
                      <li key={index} className="text-gray-600">• {name}</li>
                    ))}
                    {selectedCompanyIds.length > 3 && (
                      <li className="text-gray-500">• ... and {selectedCompanyIds.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              <p className="mt-3 text-sm text-gray-500">This action cannot be undone.</p>
            </div>
            
            {removeCompaniesFromListMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  {(removeCompaniesFromListMutation.error as any)?.message || 
                   "Failed to remove companies. Please try again."}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false)
                  removeCompaniesFromListMutation.reset()
                }}
                disabled={removeCompaniesFromListMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRemoveSelected}
                disabled={removeCompaniesFromListMutation.isPending}
              >
                {removeCompaniesFromListMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  `Remove ${selectedCompanyIds.length}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}