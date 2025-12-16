"use client"

import { useAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { ProfileInfo } from "@/components/profile/profile-info"
import { ChangePassword } from "@/components/profile/change-password"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArrowLeft, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from 'next-intl'

export default function UserProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('setting.userProfile')

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Profile Content with Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              {t('tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              {t('tabs.security')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileInfo onUpdate={() => router.refresh()} />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <ChangePassword />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
