"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function AccessDeniedPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/logout")
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <h2 className="text-xl font-semibold text-red-600 mb-4">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have the required permissions to access this page. Please contact your administrator if you believe this is an error.
          </p>
          {user && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Logged in as:</span> {user.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Role:</span> {user.role}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button variant="default" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
