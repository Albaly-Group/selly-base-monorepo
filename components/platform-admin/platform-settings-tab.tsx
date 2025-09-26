"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PlatformSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>
          System-wide configuration and settings - Coming Soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Platform-wide settings and system configuration will be implemented in the next phase.
        </p>
      </CardContent>
    </Card>
  )
}