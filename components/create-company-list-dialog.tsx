"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CompanyListCreate } from "@/lib/types/company-lists"

interface CreateCompanyListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (list: any) => void
}

export function CreateCompanyListDialog({ open, onOpenChange, onSuccess }: CreateCompanyListDialogProps) {
  const [formData, setFormData] = useState<CompanyListCreate>({
    name: "",
    description: "",
    visibility: "private",
    isShared: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("List name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In production, this would make an API call to create the list
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newList = {
        id: `list-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        ownerUserId: 'current-user',
        visibility: formData.visibility,
        isShared: formData.isShared,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onSuccess(newList)
      onOpenChange(false)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        visibility: "private",
        isShared: false
      })
    } catch (err) {
      setError("Failed to create list. Please try again.")
      console.error("Error creating list:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = formData.name.trim().length > 0 && !isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Company List</DialogTitle>
          <DialogDescription>
            Create a new list to organize and track companies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name *</Label>
            <Input
              id="list-name"
              placeholder="Enter list name..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              placeholder="Optional description for this list..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Visibility</Label>
            <RadioGroup 
              value={formData.visibility} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as any }))}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private - Only I can access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="org" id="org" />
                <Label htmlFor="org">Organization - All team members can view</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Public - Anyone with access can view</Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading ? "Creating..." : "Create List"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}