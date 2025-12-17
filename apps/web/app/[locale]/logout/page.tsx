"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useLocale } from 'next-intl'
import { useEffect } from "react"

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    // Perform logout and redirect to login with locale
    logout()
    router.replace(`/${locale}/login`)
  }, [logout, router, locale])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">{locale === 'th' ? 'กำลังออกจากระบบ...' : 'Logging out...'}</p>
      </div>
    </div>
  )
}
