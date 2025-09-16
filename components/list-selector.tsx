"use client"

import type { UserList } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, List } from "lucide-react"

interface ListSelectorProps {
  lists: UserList[]
  selectedListId: string
  onSelectList: (listId: string) => void
}

export function ListSelector({ lists, selectedListId, onSelectList }: ListSelectorProps) {
  return (
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

        <Button variant="outline" className="w-full mt-4 bg-transparent" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create New List
        </Button>
      </CardContent>
    </Card>
  )
}
