"use client"

import { useAuth, canManageTenants } from "@/lib/auth"
import { CustomerDashboard } from "@/components/customer-dashboard"
import { PlatformAdminDashboard } from "@/components/platform-admin-dashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect unauthenticated users to login
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
    // Return null while redirecting to login
    return null
  }

  // Show platform admin dashboard for platform admins
  if (canManageTenants(user)) {
    return <PlatformAdminDashboard />
  }

  // Show customer dashboard for all other users
  return <CustomerDashboard />
}
