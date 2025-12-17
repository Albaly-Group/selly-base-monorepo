"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import { useEffect } from "react"

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to dashboard with locale
      router.replace(`/${locale}/dashboard`)
    }
  }, [user, isLoading, router, locale])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only show login form for unauthenticated users
  if (!user) {
    return <LoginForm />
  }

  // Return null while redirecting
  return null
}
