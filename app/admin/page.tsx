"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UserManagementTab } from "@/components/admin/user-management-tab"
import { PoliciesTab } from "@/components/admin/policies-tab"
import { DataRetentionTab } from "@/components/admin/data-retention-tab"
import { IntegrationsTab } from "@/components/admin/integrations-tab"
import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, Database, Plug, Settings } from "lucide-react"

function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">Manage users, policies, and system settings</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Retention
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab />
          </TabsContent>

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
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  System activity and security events (Feature coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Audit log functionality will be available in a future release.</p>
                  <p className="text-sm mt-2">This will include user actions, data changes, and security events.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default requireAuth(["admin"])(AdminPage)