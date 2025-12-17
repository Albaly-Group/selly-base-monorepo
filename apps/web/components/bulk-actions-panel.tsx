"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from "@/lib/api-client"

interface BulkActionsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCompanyIds: string[]
  onComplete: () => void
}

export function BulkActionsPanel({ open, onOpenChange, selectedCompanyIds, onComplete }: BulkActionsPanelProps) {
  const t = useTranslations('staff.staff_actions')
  const [action, setAction] = useState<"approve" | "reject" | "update-status">("approve")
  const [newStatus, setNewStatus] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([
    { value: "Active", label: "Active" },
    { value: "Needs Verification", label: "Needs Verification" },
    { value: "Invalid", label: "Invalid" },
  ])

  useEffect(() => {
    const fetchContactStatuses = async () => {
      try {
        const response = await apiClient.getContactStatuses()
        if (response.data && response.data.length > 0) {
          setStatusOptions(
            response.data.map((item: any) => ({
              value: item.label,
              label: item.label,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch contact statuses, using fallback:', error)
        // Fallback options already set in state
      }
    }

    if (open) {
      fetchContactStatuses()
    }
  }, [open])

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Bulk action:", {
      action,
      companyIds: selectedCompanyIds,
      newStatus,
      reason,
    })

    setIsLoading(false)
    onComplete()

    // Reset form
    setAction("approve")
    setNewStatus("")
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { count: selectedCompanyIds.length })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>{t('actionLabel')}</Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve">{t('actions.approve')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject">{t('actions.reject')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update-status" id="update-status" />
                <Label htmlFor="update-status">{t('actions.updateStatus')}</Label>
              </div>
            </RadioGroup>
          </div>

          {action === "update-status" && (
            <div className="space-y-2">
              <Label htmlFor="new-status">{t('newStatusLabel')}</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('newStatusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(action === "reject" || action === "update-status") && (
            <div className="space-y-2">
              <Label htmlFor="reason">{t('reasonLabel')} {action === "reject" ? t('reasonRequired') : t('reasonOptional')}</Label>
              <Textarea
                id="reason"
                placeholder={t('reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || (action === "reject" && !reason.trim()) || (action === "update-status" && !newStatus)
            }
          >
            {isLoading ? t('processing') : t('applyButton', { count: selectedCompanyIds.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
