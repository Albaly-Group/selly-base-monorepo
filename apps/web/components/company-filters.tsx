"use client"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { FilterOptions } from "@/lib/types"

interface CompanyFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
}

const industrialOptions = [
  "Manufacturing",
  "Logistics",
  "Automotive",
  "Tourism",
  "Agriculture",
  "Technology",
  "Healthcare",
]

const provinceOptions = ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Chonburi", "Rayong", "Samut Prakan"]

const companySizeOptions = [
  { value: "small", label: "Small (S)" },
  { value: "medium", label: "Medium (M)" },
  { value: "large", label: "Large (L)" },
]

const contactStatusOptions = ["Active", "Needs Verification", "Invalid"]

export function CompanyFilters({ filters, onFiltersChange, onClearFilters }: CompanyFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const updateFilter = (key: keyof FilterOptions, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const removeFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Industrial Name</DropdownMenuLabel>
          {industrialOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => updateFilter("industrial", option)}
              className={filters.industrial === option ? "bg-accent" : ""}
            >
              {option}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Province</DropdownMenuLabel>
          {provinceOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => updateFilter("province", option)}
              className={filters.province === option ? "bg-accent" : ""}
            >
              {option}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Company Size</DropdownMenuLabel>
          {companySizeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilter("companySize", option.value)}
              className={filters.companySize === option.value ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Contact Status</DropdownMenuLabel>
          {contactStatusOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => updateFilter("contactStatus", option as any)}
              className={filters.contactStatus === option ? "bg-accent" : ""}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters */}
      {Object.entries(filters).map(
        ([key, value]) =>
          value && (
            <Badge key={key} variant="secondary" className="gap-1">
              {key === "industrial" && "Industry: "}
              {key === "province" && "Province: "}
              {key === "companySize" && "Size: "}
              {key === "contactStatus" && "Status: "}
              {value}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(key as keyof FilterOptions)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ),
      )}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      )}
    </div>
  )
}
