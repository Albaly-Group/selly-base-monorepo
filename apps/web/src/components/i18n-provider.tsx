"use client"

import React from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  // Log init state for debugging
  React.useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('[I18nProvider] i18n initialized:', i18n.isInitialized, 'lang:', i18n.language)
    } catch (e) {}
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
