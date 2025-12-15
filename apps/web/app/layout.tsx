import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { Toaster } from "@/components/ui/toaster"
import I18nProvider from "@/components/i18n-provider"
import LanguageSwitch from "@/components/language-switch"
import "./globals.css"

export const metadata: Metadata = {
  title: "SalesSphere Base - B2B Prospecting Platform",
  description: "Professional B2B prospecting and lead management platform for business growth",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <I18nProvider>
                <div style={{position: 'fixed', top: 8, right: 8, zIndex: 999}}>
                  <LanguageSwitch />
                </div>
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
              </I18nProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
