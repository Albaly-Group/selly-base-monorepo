"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
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

interface CompanyList {
  id: string
  name: string
  description?: string
}

export function AddToListDialog({ open, onOpenChange, selectedCompanyIds, onSuccess }: AddToListDialogProps) {
  const [listOption, setListOption] = useState<"existing" | "new">("existing")
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lists, setLists] = useState<CompanyList[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch user lists when dialog opens
  useEffect(() => {
    if (open) {
      const fetchLists = async () => {
        try {
          const response = await apiClient.getCompanyLists()
          if (response.data) {
            setLists(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch lists:', error)
          setLists([])
        }
      }
      fetchLists()
    }
  }, [open])

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

        const newList = await apiClient.createCompanyList({
          name: newListName.trim(),
          description: newListDescription.trim() || undefined
        })
        targetListId = newList.id
      }

      if (!targetListId) {
        setMessage({ type: 'error', text: 'Please select a list.' })
        setIsLoading(false)
        return
      }

      // Add companies to the list
      await apiClient.addCompaniesToList(targetListId, selectedCompanyIds)
      
      setMessage({ 
        type: 'success', 
        text: `Successfully added ${selectedCompanyIds.length} companies to the list.` 
      })
      
      // Close dialog and trigger refresh after a short delay
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        setMessage(null)
        // Reset form
        setListOption("existing")
        setSelectedListId("")
        setNewListName("")
        setNewListDescription("")
      }, 1500)
      
    } catch (error) {
      console.error('Error adding companies to list:', error)
      setMessage({ type: 'error', text: 'Failed to add companies to list.' })
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
                  {lists.map((list) => (
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
