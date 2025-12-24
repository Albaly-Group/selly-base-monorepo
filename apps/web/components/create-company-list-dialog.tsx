"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from "@/lib/api-client"
import { useTranslations } from 'next-intl'
import type { UserList } from "@/lib/types"

interface CreateCompanyListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (list?: UserList) => void
}

export function CreateCompanyListDialog({ open, onOpenChange, onSuccess }: CreateCompanyListDialogProps) {
  const t = useTranslations('companies_lookup')
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError(t('addToList.errorName') || 'List name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use API client to create company list
      const newList = await apiClient.createCompanyList({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        visibility: 'private',
        isShared: false
      })
      
      console.log('Created new list:', newList)
      
      // Reset form
      setFormData({
        name: "",
        description: ""
      })
      
      onSuccess(newList)
      onOpenChange(false)

    } catch (error: any) {
      console.error("Error creating list:", error)
      setError(error.message || tCommon('error') || "Failed to create list. Please ensure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = formData.name.trim().length > 0 && !isLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addToList.createAndAdd') || (tCommon('create') + ' New Company List')}</DialogTitle>
          <DialogDescription>
            {'Create a new list to organize and track companies.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">{t('addToList.listName') || 'List Name *'}</Label>
            <Input
              id="list-name"
              placeholder={t('addToList.listNamePlaceholder') || 'Enter list name...'}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list-description">{t('addToList.listDescription') || 'Description (Optional)'}</Label>
            <Textarea
              id="list-description"
              placeholder={t('addToList.listDescriptionPlaceholder') || 'Optional description for this list...'}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
              rows={3}
            />
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
              {tCommon('cancel') || 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading ? (t('addToList.processing') || 'Creating...') : (t('addToList.createAndAdd') || 'Create List')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}