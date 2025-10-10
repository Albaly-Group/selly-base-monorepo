"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState<number>(-1)

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setHighlight(-1)
      // focus input when popover opens
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const selectValue = (v: string) => {
    onValueChange?.(v === value ? "" : v)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
      listRef.current?.querySelectorAll('li')[Math.min(Math.max(highlight + 1, 0), Math.max(filtered.length - 1, 0))]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
      listRef.current?.querySelectorAll('li')[Math.max(highlight - 1, 0)]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlight >= 0 && highlight < filtered.length) {
        selectValue(filtered[highlight].value)
      } else if (filtered.length === 1) {
        selectValue(filtered[0].value)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn("w-full justify-between", className)}
          onKeyDown={onTriggerKeyDown}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-2" align="start">
        <div>
          <input
            ref={inputRef}
            className="w-full border-b px-2 py-2 outline-none text-sm"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlight(-1)
            }}
            onKeyDown={onInputKeyDown}
            aria-controls="combobox-list"
            aria-autocomplete="list"
          />

          <ul
            id="combobox-list"
            role="listbox"
            ref={listRef}
            className="max-h-48 overflow-y-auto mt-2 space-y-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
            )}

            {filtered.map((opt, idx) => {
              const isSelected = value === opt.value
              const isHighlighted = highlight === idx
              return (
                <li
                  key={opt.value || `option-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectValue(opt.value)}
                  className={cn(
                    "cursor-pointer select-none px-3 py-2 rounded-md text-sm",
                    isHighlighted ? "bg-accent/30" : "",
                    isSelected ? "font-medium" : ""
                  )}
                >
                  {isSelected ? "✓ " : ""}
                  {opt.label}
                </li>
              )
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}
