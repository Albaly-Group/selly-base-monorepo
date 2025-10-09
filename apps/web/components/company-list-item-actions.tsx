"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { useRemoveCompaniesFromList } from "@/lib/hooks/api-hooks"

interface CompanyListItemActionsProps {
  listId: string
  companyId: string
  companyName?: string
  onRemoved?: () => void
  className?: string
}

export function CompanyListItemActions({ 
  listId, 
  companyId, 
  companyName, 
  onRemoved,
  className = ""
}: CompanyListItemActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const removeCompaniesFromListMutation = useRemoveCompaniesFromList()

  const handleRemoveCompany = async () => {
    try {
      await removeCompaniesFromListMutation.mutateAsync({
        listId,
        data: { companyIds: [companyId] }
      })
      
      setShowDeleteConfirm(false)
      
      if (onRemoved) {
        onRemoved()
      }
    } catch (error) {
      console.error("Failed to remove company from list:", error)
    }
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={removeCompaniesFromListMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-1">Remove</span>
        </Button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Company</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove 
              {companyName ? (
                <span className="font-medium"> "{companyName}" </span>
              ) : (
                " this company "
              )}
              from this list? This action cannot be undone.
            </p>
            
            {removeCompaniesFromListMutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  {(removeCompaniesFromListMutation.error as any)?.message || 
                   "Failed to remove company. Please try again."}
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
                onClick={handleRemoveCompany}
                disabled={removeCompaniesFromListMutation.isPending}
              >
                {removeCompaniesFromListMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}