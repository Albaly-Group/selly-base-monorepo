"use client"

import { useAuth, canManageTenants, canManageOrganizationUsers } from "@/lib/auth"
import { CustomerDashboard } from "@/components/customer-dashboard"
import { PlatformAdminDashboard } from "@/components/platform-admin-dashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect unauthenticated users to login
        router.replace("/login")
        return
      }
      if (canManageTenants(user)) {
        router.replace("/platform-admin")
        return
      }
      if (canManageOrganizationUsers(user)) {
        router.replace("/admin")
        return
      }
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

  // Platform admins should be redirected to /platform-admin, but show their dashboard if they're here
  if (canManageTenants(user)) {
    return <PlatformAdminDashboard />
  }

  // Show customer dashboard for regular users, staff, and customer admins
  return <CustomerDashboard />
}
