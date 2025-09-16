"use client"

import { useState } from "react"
import { mockUserLists } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddToListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCompanyIds: string[]
  onSuccess: () => void
}

export function AddToListDialog({ open, onOpenChange, selectedCompanyIds, onSuccess }: AddToListDialogProps) {
  const [listOption, setListOption] = useState<"existing" | "new">("existing")
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Here you would normally make an API call to add companies to the list
    console.log("Adding companies to list:", {
      companyIds: selectedCompanyIds,
      listOption,
      selectedListId,
      newListName,
    })

    setIsLoading(false)
    onSuccess()

    // Reset form
    setListOption("existing")
    setSelectedListId("")
    setNewListName("")
  }

  const canSubmit = listOption === "existing" ? selectedListId : newListName.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Companies to List</DialogTitle>
          <DialogDescription>Add {selectedCompanyIds.length} selected companies to a list.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={listOption} onValueChange={(value) => setListOption(value as "existing" | "new")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Add to existing list</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">Create new list</Label>
            </div>
          </RadioGroup>

          {listOption === "existing" && (
            <div className="space-y-2">
              <Label htmlFor="list-select">Select List</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a list..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUserLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.companyIds.length} companies)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {listOption === "new" && (
            <div className="space-y-2">
              <Label htmlFor="new-list-name">List Name</Label>
              <Input
                id="new-list-name"
                placeholder="Enter list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
