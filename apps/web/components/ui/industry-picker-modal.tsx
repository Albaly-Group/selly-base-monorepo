"use client"

import * as React from "react"
import { useMemo } from "react"
import { Building2 } from "lucide-react"
import { GenericPickerModal, GenericPickerTrigger, PickerOption } from "./generic-picker-modal"

export interface IndustryOption {
    id: string
    code: string
    titleEn: string
    titleTh?: string | null
    description?: string | null
}

interface IndustryPickerModalSingleProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    value: string | null
    onValueChange: (value: string | null) => void
    options: IndustryOption[]
    isLoading?: boolean
}

export function IndustryPickerModal({
    open,
    onOpenChange,
    value,
    onValueChange,
    options,
    isLoading = false,
}: IndustryPickerModalSingleProps) {
    const pickerOptions: PickerOption[] = useMemo(() => {
        return options.map((industry) => ({
            id: industry.id,
            label: `${industry.code} - ${industry.titleEn}`,
            secondaryLabel: industry.titleTh || undefined,
            description: industry.description || undefined,
            metadata: { code: industry.code },
        }))
    }, [options])

    return (
        <GenericPickerModal
            open={open}
            onOpenChange={onOpenChange}
            value={value}
            onValueChange={onValueChange}
            options={pickerOptions}
            isLoading={isLoading}
            title="Select Industry"
            description="Search and select an industry from the list"
            placeholder="Search industry codes..."
            emptyText="No industries found"
            emptyIcon={<Building2 className="h-8 w-8 mb-2" />}
        />
    )
}

interface IndustryPickerTriggerSingleProps {
    value: string | null
    options: IndustryOption[]
    onClick: () => void
    placeholder?: string
    className?: string
}

export function IndustryPickerTrigger({
    value,
    options,
    onClick,
    placeholder = "Select industry...",
    className,
}: IndustryPickerTriggerSingleProps) {
    const pickerOptions: PickerOption[] = useMemo(() => {
        return options.map((industry) => ({
            id: industry.id,
            label: `${industry.code} - ${industry.titleEn}`,
            secondaryLabel: industry.titleTh || undefined,
        }))
    }, [options])

    return (
        <GenericPickerTrigger
            value={value}
            options={pickerOptions}
            onClick={onClick}
            placeholder={placeholder}
            className={className}
            icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
    )
}
