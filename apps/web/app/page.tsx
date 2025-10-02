"use client"

import { useAuth, canManageTenants, canManageOrganizationUsers } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { CustomerDashboard } from "@/components/customer-dashboard"
import { PlatformAdminDashboard } from "@/components/platform-admin-dashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect users based on their permissions to their appropriate dashboards
  useEffect(() => {
    if (!isLoading && user) {
      if (canManageTenants(user)) {
        router.replace("/platform-admin")
        return
      }
      if (canManageOrganizationUsers(user)) {
        router.replace("/admin")
        return
      }
      // Regular users and staff stay on the home page with customer dashboard
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
    return <LoginForm />
  }

  // Platform admins should be redirected to /platform-admin, but show their dashboard if they're here
  if (canManageTenants(user)) {
    return <PlatformAdminDashboard />
  }

  // Show customer dashboard for regular users, staff, and customer admins
  return <CustomerDashboard />
}
