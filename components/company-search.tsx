"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CompanySearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearSearch: () => void
}

export function CompanySearch({ searchTerm, onSearchChange, onClearSearch }: CompanySearchProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Companies
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search by Company name, Registration ID, or keyword…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Search examples:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Company Name:</strong> "ABC Manufacturing" or "บริษัท เอบีซี"</li>
          <li><strong>Registration ID:</strong> "0105564111698" (13 digits)</li>
          <li><strong>Industry:</strong> "Manufacturing", "Logistics", "Tourism"</li>
        </ul>
      </div>
    </div>
  )
}
