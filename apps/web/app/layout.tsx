import type React from "react"

// Root layout - pass through to locale-specific layout
// This is required for next-intl routing structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
