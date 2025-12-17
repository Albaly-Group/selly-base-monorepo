"use client"

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

type Locale = 'en' | 'th'

// Language names displayed in UI
const languages: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย'
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: Locale) => {
    if (!pathname) return

    // Split and remove empty segments, then drop the leading locale segment if present
    const segments = pathname.split('/').filter(Boolean)

    // If the first segment is a supported locale, remove it
    const first = segments[0]
    const pathSegments = (first === 'en' || first === 'th') ? segments.slice(1) : segments

    // Rebuild the path without empty or literal "undefined" parts
    const pathWithoutLocale = pathSegments.filter(Boolean).filter(s => s !== 'undefined').join('/')

    const newPath = pathWithoutLocale ? `/${newLocale}/${pathWithoutLocale}` : `/${newLocale}`

    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{languages[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([lang, label]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => switchLanguage(lang as Locale)}
            className={locale === lang ? 'bg-accent' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
