"use client"

import { useState } from "react"
import { mockUserLists, addCompaniesToList, createCompanyList } from "@/lib/mock-data"
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
  const [newListDescription, setNewListDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      let targetListId = selectedListId

      // Create new list if needed
      if (listOption === "new") {
        if (!newListName.trim()) {
          setMessage({ type: 'error', text: 'Please enter a list name.' })
          setIsLoading(false)
          return
        }

        const newList = createCompanyList(newListName.trim(), newListDescription.trim() || undefined)
        targetListId = newList.id
        console.log('Created new list:', newList)
      }

      if (!targetListId) {
        setMessage({ type: 'error', text: 'Please select a list.' })
        setIsLoading(false)
        return
      }

      // Add companies to the list
      const result = addCompaniesToList(targetListId, selectedCompanyIds)

      // Show success/warning messages
      let successMessage = ""
      if (result.added.length > 0) {
        successMessage = `Successfully added ${result.added.length} companies to the list.`
      }

      if (result.skipped.length > 0) {
        const duplicates = result.skipped.filter(s => s.reason === 'DUPLICATE').length
        const notFound = result.skipped.filter(s => s.reason === 'NOT_FOUND').length
        
        if (duplicates > 0) successMessage += ` ${duplicates} already in list.`
        if (notFound > 0) successMessage += ` ${notFound} companies not found.`
      }

      setMessage({ type: 'success', text: successMessage })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log('Add to list result:', result)

      // Wait a moment to show success message, then close
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        
        // Reset form
        setListOption("existing")
        setSelectedListId("")
        setNewListName("")
        setNewListDescription("")
        setMessage(null)
      }, 1500)

    } catch (error: any) {
      console.error("Error adding companies to list:", error)
      setMessage({ 
        type: 'error', 
        text: error.message || "Failed to add companies to list. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
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
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-list-name">List Name *</Label>
                <Input
                  id="new-list-name"
                  placeholder="Enter list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-list-description">Description (Optional)</Label>
                <Input
                  id="new-list-description"
                  placeholder="Enter list description..."
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? "Processing..." : listOption === "new" ? "Create List & Add" : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
