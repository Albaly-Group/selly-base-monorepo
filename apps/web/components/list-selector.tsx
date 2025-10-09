"use client"

import { useState } from "react"
import type { UserList } from "@/lib/types"
import type { CompanyList } from "@/lib/types/company-lists"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, List, Eye, Users, Globe, Trash2 } from "lucide-react"
import { CreateCompanyListDialog } from "@/components/create-company-list-dialog"
import { apiClient } from "@/lib/api-client"
import { useDeleteCompanyList } from "@/lib/hooks/api-hooks"

interface EnhancedListSelectorProps {
  lists: CompanyList[]
  selectedListId: string
  onSelectList: (listId: string) => void
  onListCreated?: (list: CompanyList) => void
}

interface ListSelectorProps {
  lists: UserList[]
  selectedListId: string
  onSelectList: (listId: string) => void
  onListsUpdate?: () => void // Add callback for when lists are updated
  isLoading?: boolean // Add loading state
}

// Enhanced component using new CompanyList types
export function EnhancedListSelector({ lists, selectedListId, onSelectList, onListCreated }: EnhancedListSelectorProps) {
  console.log("lists", lists);
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-3 w-3" />
      case 'org': return <Users className="h-3 w-3" />
      default: return <Eye className="h-3 w-3" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-blue-600'
      case 'org': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleListCreated = (newList: CompanyList) => {
    if (onListCreated) {
      onListCreated(newList)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div>
              <button><List className="h-5 w-5" /></button>
              My Lists
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lists.map((list) => (
            <Button
              key={list.id}
              variant={selectedListId === list.id ? "default" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onSelectList(list.id)}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate">{list.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {list.totalCompanies || 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={getVisibilityColor(list.visibility)}>
                    <span className="flex items-center gap-1">
                      {getVisibilityIcon(list.visibility)}
                      {list.visibility}
                    </span>
                  </span>
                  {list.isShared && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Shared</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                </div>
                {list.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{list.description}</p>
                )}
              </div>
            </Button>
          ))}

          {lists.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No lists created yet</p>
              <p className="text-xs mt-1">Create your first company list</p>
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4 bg-transparent"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New List
          </Button>
        </CardContent>
      </Card>

      <CreateCompanyListDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newList) => handleListCreated(newList as any)}
      />
    </>
  )
}

export function ListSelector({ lists, selectedListId, onSelectList, onListsUpdate }: ListSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteCompanyListMutation = useDeleteCompanyList()
  console.log(lists);
  console.log(selectedListId);

  const handleDeleteList = async() => {
    if(!selectedListId) {
      return;
    }
  
    try {
      await deleteCompanyListMutation.mutateAsync(selectedListId);
      console.log("Delete Successful");
      setShowDeleteConfirm(false);

      // Clear selection first
      try {
        onSelectList("")
      } catch (err) {
        console.warn('onSelectList threw an error', err)
      }

      // Then refresh the list
      if (onListsUpdate) {
        try {
          onListsUpdate()
        } catch (err) {
          console.warn('onListsUpdate threw an error', err)
        }
      }
    } catch(error: any) {
      console.error("Delete Failed", error);
    }
  }

  const handleListCreated = () => {
    setShowCreateDialog(false)
    if (onListsUpdate) {
      onListsUpdate()
    }
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button><List className="h-5 w-5" /></button>
              My Lists
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!selectedListId || deleteCompanyListMutation.isPending}
                className={`${!selectedListId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} p-1 rounded`}
                title={!selectedListId ? "Select a list to delete" : "Delete selected list"}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lists.map((list) => (
            <Button
              key={list.id}
              variant={selectedListId === list.id ? "default" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onSelectList(list.id)}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate">{list.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {(list as any).totalCompanyCount ?? 0} items
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(list.createdAt).toDateString()}</span>
                  <span className="text-gray-500">{list.status}</span>
                </div>
              </div>
            </Button>
          ))}

          {lists.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No lists created yet</p>
              <p className="text-sm mt-1">Create lists from Company Lookup</p>
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4 bg-transparent"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New List
          </Button>
          {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this list? This action cannot be undone and all companies in this list will be removed.
              </p>
              
              {deleteCompanyListMutation.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    {(deleteCompanyListMutation.error as any)?.message || "Failed to delete list. Please try again."}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    deleteCompanyListMutation.reset();
                  }}
                  disabled={deleteCompanyListMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteList}
                  disabled={deleteCompanyListMutation.isPending}
                >
                  {deleteCompanyListMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      <CreateCompanyListDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => handleListCreated()}
      />
    </>
  )
}
