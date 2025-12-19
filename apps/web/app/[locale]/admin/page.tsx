"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UserManagementTab } from "@/components/admin/user-management-tab"
import { PoliciesTab } from "@/components/admin/policies-tab"
import { DataRetentionTab } from "@/components/admin/data-retention-tab"
import { IntegrationsTab } from "@/components/admin/integrations-tab"
import { requireAuth, useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Database, Plug, Settings, Building } from "lucide-react"
import { useTranslations } from 'next-intl'

function AdminPage() {
  const { user } = useAuth()

  const t = useTranslations('organization_administration.user_role')
  const isPlatformAdminOrStaff =
    !!user && (
      ['platform_admin', 'platform_staff'].includes(user.role as string) ||
      !!user.roles?.some((r) => ['platform_admin', 'platform_staff'].includes(r.name))
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Building className="h-3 w-3 mr-1" />
              {t('badge')}
            </Badge>
          </div>
          <p className="text-gray-600">{t('subtitle')}</p>
          <p className="text-sm text-orange-600 mt-1">
            <strong>{t('noteTitle')}</strong> {t('noteBody')}
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className={`grid w-full ${isPlatformAdminOrStaff ? 'grid-cols-5' : 'grid-cols-5'}`}>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('tabs.users')}
            </TabsTrigger>
            {isPlatformAdminOrStaff && (
              <>
                <TabsTrigger value="policies" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('tabs.policies')}
                </TabsTrigger>
                <TabsTrigger value="retention" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {t('tabs.retention')}
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  {t('tabs.integrations')}
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('tabs.audit')}
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab />
          </TabsContent>

          {isPlatformAdminOrStaff && (
            <>
              <TabsContent value="policies" className="space-y-6">
                <PoliciesTab />
              </TabsContent>

              <TabsContent value="retention" className="space-y-6">
                <DataRetentionTab />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <IntegrationsTab />
              </TabsContent>

              <TabsContent value="audit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('audit.title')}</CardTitle>
                    <CardDescription>{t('audit.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>{t('audit.comingSoonTitle')}</p>
                      <p className="text-sm mt-2">{t('audit.comingSoonBody')}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default requireAuth(["users:manage", "users:*", "org:*", "*"])(AdminPage)