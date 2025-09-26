"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlatformAnalyticsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Analytics</CardTitle>
        <CardDescription>
          Platform-wide usage analytics and reporting - Coming Soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Advanced platform analytics and cross-tenant reporting will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}