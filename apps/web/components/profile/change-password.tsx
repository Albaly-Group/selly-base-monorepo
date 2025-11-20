"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PasswordRequirement {
  label: string
  met: boolean
}

export function ChangePassword() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Password strength validation
  const passwordRequirements: PasswordRequirement[] = [
    {
      label: "At least 8 characters",
      met: formData.newPassword.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.newPassword),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(formData.newPassword),
    },
    {
      label: "Contains number",
      met: /\d/.test(formData.newPassword),
    },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    },
  ]

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = formData.newPassword === formData.confirmPassword

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (!allRequirementsMet) {
      newErrors.newPassword = "Password does not meet all requirements"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (!passwordsMatch) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (formData.currentPassword === formData.newPassword && formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      await apiClient.changePassword(
        formData.currentPassword,
        formData.newPassword
      )

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  setErrors({ ...errors, currentPassword: "" })
                }}
                disabled={isSaving}
                placeholder="Enter your current password"
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("current")}
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  setErrors({ ...errors, newPassword: "" })
                }}
                disabled={isSaving}
                placeholder="Enter your new password"
                className={errors.newPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword}</p>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="mt-3 space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">Password requirements:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  setErrors({ ...errors, confirmPassword: "" })
                }}
                disabled={isSaving}
                placeholder="Confirm your new password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Security Alert */}
          <Alert>
            <AlertDescription className="text-sm">
              After changing your password, you will need to log in again on all your devices.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving || !allRequirementsMet || !passwordsMatch}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
