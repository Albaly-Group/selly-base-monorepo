"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Mail, Building2, Shield, Calendar, User } from "lucide-react"
import { useTranslations } from 'next-intl'

interface ProfileInfoProps {
  onUpdate?: () => void
}

export function ProfileInfo({ onUpdate }: ProfileInfoProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const t = useTranslations('setting.userProfile.userInfo')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await apiClient.updateProfile({
        name: formData.name,
      })
      
      // Update local storage
      const storedUser = localStorage.getItem("selly-user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.name = formData.name
        localStorage.setItem("selly-user", JSON.stringify(userData))
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })

      setIsEditing(false)
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    })
    setIsEditing(false)
  }

  if (!user) return null

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('fullName')}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing || isSaving}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">{t('emailNote')}</p>
          </div>

          <Separator />

          {/* Additional Info (Read-only) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </Label>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {user.organization?.name || t('noOrganization')}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </Label>
                <div className="rounded-md border bg-muted px-3 py-2">
                <div className="space-y-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <div key={role.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{role.name}</span>
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 5).map((perm) => (
                              <Badge key={perm.id} variant="outline" className="text-xs">
                                {perm.key}
                              </Badge>
                            ))}
                            {role.permissions.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm">{t('rolesPermissions')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                {t('edit')}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('saveChanges')}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
