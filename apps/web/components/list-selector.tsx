"use client"

import { useState } from "react"
import type { UserList } from "@/lib/types"
import type { CompanyList } from "@/lib/types/company-lists"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, List, Eye, Users, Globe } from "lucide-react"
import { CreateCompanyListDialog } from "@/components/create-company-list-dialog"

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
            <List className="h-5 w-5" />
            My Lists
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
                    {list.itemCount}
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
        onSuccess={handleListCreated}
      />
    </>
  )
}

// Backward compatible component for existing code
export function ListSelector({ lists, selectedListId, onSelectList, onListsUpdate }: ListSelectorProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            My Lists
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
                    {list.companyIds.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{list.createdAt}</span>
                  <span>•</span>
                  <span className={list.status === "Active" ? "text-green-600" : "text-gray-500"}>{list.status}</span>
                </div>
              </div>
            </Button>
          ))}

          {lists.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No lists created yet</p>
              <p className="text-xs mt-1">Create lists from Company Lookup</p>
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
        onSuccess={handleListCreated}
      />
    </>
  )
}
