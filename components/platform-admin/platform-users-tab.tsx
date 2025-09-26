"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlatformUsersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform User Management</CardTitle>
        <CardDescription>
          Manage users across all tenant organizations - Coming Soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Platform-wide user management functionality will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}