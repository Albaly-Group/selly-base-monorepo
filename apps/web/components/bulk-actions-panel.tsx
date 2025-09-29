"use client"

import { useState } from "react"
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

interface BulkActionsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCompanyIds: string[]
  onComplete: () => void
}

export function BulkActionsPanel({ open, onOpenChange, selectedCompanyIds, onComplete }: BulkActionsPanelProps) {
  const [action, setAction] = useState<"approve" | "reject" | "update-status">("approve")
  const [newStatus, setNewStatus] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>Apply actions to {selectedCompanyIds.length} selected companies.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Action</Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve">Approve all selected companies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject">Reject all selected companies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update-status" id="update-status" />
                <Label htmlFor="update-status">Update verification status</Label>
              </div>
            </RadioGroup>
          </div>

          {action === "update-status" && (
            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Needs Verification">Needs Verification</SelectItem>
                  <SelectItem value="Invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(action === "reject" || action === "update-status") && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason {action === "reject" ? "(Required)" : "(Optional)"}</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || (action === "reject" && !reason.trim()) || (action === "update-status" && !newStatus)
            }
          >
            {isLoading ? "Processing..." : `Apply to ${selectedCompanyIds.length} Companies`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
