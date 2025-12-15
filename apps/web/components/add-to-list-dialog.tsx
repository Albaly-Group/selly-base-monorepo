"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'
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
  totalCompanies?: number
  companyListItems?: Array<{ id: string }>
}

export function AddToListDialog({ open, onOpenChange, selectedCompanyIds, onSuccess }: AddToListDialogProps) {
  const t = useTranslations('companies_lookup.addToList')
  const [listOption, setListOption] = useState<"existing" | "new">("existing")
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lists, setLists] = useState<CompanyList[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
          setMessage({ type: 'error', text: t('errorName') })
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
        setMessage({ type: 'error', text: t('errorSelect') })
        setIsLoading(false)
        return
      }

      await apiClient.addCompaniesToList(targetListId, selectedCompanyIds)
      
      setMessage({ 
        type: 'success', 
        text: t('success', { count: selectedCompanyIds.length })
      })
      
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        setMessage(null)
        setListOption("existing")
        setSelectedListId("")
        setNewListName("")
        setNewListDescription("")
      }, 1500)
      
    } catch (error) {
      console.error('Error adding companies to list:', error)
      setMessage({ type: 'error', text: t('error') })
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = listOption === "existing" ? selectedListId : newListName.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { count: selectedCompanyIds.length })}</DialogDescription>
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
              <Label htmlFor="existing">{t('existing')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">{t('new')}</Label>
            </div>
          </RadioGroup>

          {listOption === "existing" && (
            <div className="space-y-2">
              <Label htmlFor="list-select">{t('selectList')}</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('choosePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.companyListItems?.length || 0} {t('companies')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {listOption === "new" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-list-name">{t('listName')}</Label>
                <Input
                  id="new-list-name"
                  placeholder={t('listNamePlaceholder')}
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-list-description">{t('listDescription')}</Label>
                <Input
                  id="new-list-description"
                  placeholder={t('listDescriptionPlaceholder')}
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
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? t('processing') : listOption === "new" ? t('createAndAdd') : t('addToList')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
