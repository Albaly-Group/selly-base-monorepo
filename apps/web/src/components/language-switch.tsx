"use client"

import React from "react"
import i18n from "@/lib/i18n"

export default function LanguageSwitch() {
  const [lang, setLang] = React.useState(i18n.language || 'en')

  React.useEffect(() => {
    const onChange = (lng: string) => setLang(lng)
    i18n.on('languageChanged', onChange)
    return () => { i18n.off('languageChanged', onChange) }
  }, [])

  function switchLang(lng: string) {
    // log and change
    // eslint-disable-next-line no-console
    console.log('[LanguageSwitch] changeLanguage ->', lng)
    i18n.changeLanguage(lng).then(() => {
      try { localStorage.setItem('lang', lng) } catch {}
      // eslint-disable-next-line no-console
      console.log('[LanguageSwitch] language changed, current=', i18n.language)
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[LanguageSwitch] changeLanguage error', err)
    })
  }

  return (
    <div style={{display: 'flex', gap: 8}}>
      <button onClick={() => switchLang('en')} aria-pressed={lang === 'en'} disabled={lang === 'en'}>EN</button>
      <button onClick={() => switchLang('th')} aria-pressed={lang === 'th'} disabled={lang === 'th'}>ไทย</button>
    </div>
  )
}
