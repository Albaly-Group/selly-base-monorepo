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
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Database, Plug, Settings, Building } from "lucide-react"

function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Organization Administration</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Building className="h-3 w-3 mr-1" />
              Customer Admin
            </Badge>
          </div>
          <p className="text-gray-600">Manage your organization&apos;s users, policies, and tenant-specific settings</p>
          <p className="text-sm text-orange-600 mt-1">
            <strong>Note:</strong> This admin panel manages settings for your organization only. 
            You can see shared Albaly data but can only manage your organization&apos;s users and data.
          </p>
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

export default requireAuth(["admin", "customer_admin"])(AdminPage)