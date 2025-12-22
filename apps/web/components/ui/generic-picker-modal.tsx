"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Check, X, Loader2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

export interface PickerOption {
    id: string
    label: string
    secondaryLabel?: string
    description?: string
    metadata?: Record<string, any>
}

interface GenericPickerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    value: string | null
    onValueChange: (value: string | null) => void
    options: PickerOption[]
    isLoading?: boolean
    title?: string
    description?: string
    placeholder?: string
    emptyText?: string
    emptyIcon?: React.ReactNode
    searchFields?: (keyof PickerOption)[]
    showClearButton?: boolean
}

export function GenericPickerModal({
    open,
    onOpenChange,
    value,
    onValueChange,
    options,
    isLoading = false,
    title = "Select an Option",
    description = "Search and select from the list",
    placeholder = "Search...",
    emptyText = "No options found",
    emptyIcon,
    searchFields = ["label", "secondaryLabel", "description"],
    showClearButton = true,
}: GenericPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedValue, setSelectedValue] = useState<string | null>(value)

    // Reset selected value when modal opens
    useEffect(() => {
        if (open) {
            setSelectedValue(value)
            setSearchQuery("")
        }
    }, [open, value])

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options

        const query = searchQuery.toLowerCase()
        return options.filter((option) => {
            const searchString = searchFields
                .map(field => String(option[field] || ""))
                .join(" ")
                .toLowerCase()
            return searchString.includes(query)
        })
    }, [options, searchQuery, searchFields])

    const handleSelect = useCallback((id: string) => {
        setSelectedValue(prev => prev === id ? null : id)
    }, [])

    const handleClear = useCallback(() => {
        setSelectedValue(null)
    }, [])

    const handleConfirm = useCallback(() => {
        onValueChange(selectedValue)
        onOpenChange(false)
    }, [selectedValue, onValueChange, onOpenChange])

    const handleCancel = useCallback(() => {
        setSelectedValue(value)
        onOpenChange(false)
    }, [value, onOpenChange])

    const selectedOption = useMemo(() => {
        return options.find(o => o.id === selectedValue)
    }, [options, selectedValue])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {/* Search Input and Actions */}
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {selectedValue ? "1 selected" : "None selected"}
                        </span>
                        {selectedValue && showClearButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                            >
                                Clear Selection
                            </Button>
                        )}
                    </div>
                </div>

                {/* Selected Item Scorebar (badge-style) */}
                {selectedOption && (
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-auto p-2 border rounded-md bg-muted/30">
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <div className="min-w-0">
                                <div className="font-medium text-sm truncate">
                                    {selectedOption.label}
                                </div>
                                {selectedOption.secondaryLabel && (
                                    <div className="text-xs text-muted-foreground truncate">
                                        {selectedOption.secondaryLabel}
                                    </div>
                                )}
                            </div>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={handleClear}
                            />
                        </Badge>
                    </div>
                )}

                {/* Options List (native scroll for reliability) */}
                <div className="flex-1 min-h-[250px] max-h-[350px] border rounded-md overflow-y-auto pr-2">
                    <div className="p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                {emptyIcon || <Search className="h-8 w-8 mb-2" />}
                                <p className="text-sm">{emptyText}</p>
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors w-full text-left",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        selectedValue === option.id && "bg-accent border border-primary"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">
                                                {option.label}
                                            </span>
                                            {selectedValue === option.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                        {option.secondaryLabel && (
                                            <p className="text-sm text-muted-foreground">
                                                {option.secondaryLabel}
                                            </p>
                                        )}
                                        {option.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface GenericPickerTriggerProps {
    value: string | null
    options: PickerOption[]
    onClick: () => void
    placeholder?: string
    className?: string
    icon?: React.ReactNode
}

export function GenericPickerTrigger({
    value,
    options,
    onClick,
    placeholder = "Select an option...",
    className,
    icon,
}: GenericPickerTriggerProps) {
    const selectedOption = useMemo(() => {
        return options.find(o => o.id === value)
    }, [value, options])

    return (
        <Button
            type="button"
            variant="outline"
            role="combobox"
            onClick={onClick}
            className={cn(
                "w-full justify-between text-left font-normal h-10",
                !value && "text-muted-foreground",
                className
            )}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {icon}
                {selectedOption ? (
                    <span className="truncate">{selectedOption.label}</span>
                ) : (
                    <span>{placeholder}</span>
                )}
            </div>
            <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    )
}
