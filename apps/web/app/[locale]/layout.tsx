import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/src/i18n'
import { AuthProvider } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { Toaster } from "@/components/ui/toaster"
import "../globals.css"

export const metadata: Metadata = {
  title: "SalesSphere Base - B2B Prospecting Platform",
  description: "Professional B2B prospecting and lead management platform for business growth",
  generator: "v0.app",
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// Type guard function
function isValidLocale(locale: string): locale is typeof locales[number] {
  return locales.includes(locale as typeof locales[number])
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for this locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  )
}
