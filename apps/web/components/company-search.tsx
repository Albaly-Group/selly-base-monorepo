"use client"

import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

interface CompanySearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearSearch: () => void
  onSearchSubmit?: () => void
  onOpenSmartFiltering?: () => void
}

export function CompanySearch({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch, 
  onSearchSubmit,
  onOpenSmartFiltering 
}: CompanySearchProps) {
  const t = useTranslations('companies_lookup.search')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchSubmit) {
      onSearchSubmit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit()
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label')}
            </label>
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t('placeholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button 
                type="submit"
                className="ml-2 px-3"
                disabled={!searchTerm.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {onOpenSmartFiltering && (
            <Button
              type="button"
              variant="outline"
              onClick={onOpenSmartFiltering}
              className="flex items-center gap-2 mb-0"
            >
              <Filter className="h-4 w-4" />
              {t('smartFiltering')}
            </Button>
          )}
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-1">{t('supports')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('companyNameEn')}</li>
          <li>{t('registeredNo')}</li>
          <li>{t('keywords')}</li>
        </ul>
      </div>
    </div>
  )
}
