"use client"

import * as React from "react"
import { useMemo } from "react"
import { MapPin } from "lucide-react"
import { GenericPickerModal, GenericPickerTrigger, PickerOption } from "./generic-picker-modal"

export interface ProvinceOption {
    id: string
    code: string
    nameEn: string
    nameTh?: string | null
    regionType?: string
}

interface ProvincePickerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    value: string | null
    onValueChange: (value: string | null) => void
    options: ProvinceOption[]
    isLoading?: boolean
}

export function ProvincePickerModal({
    open,
    onOpenChange,
    value,
    onValueChange,
    options,
    isLoading = false,
}: ProvincePickerModalProps) {
    const pickerOptions: PickerOption[] = useMemo(() => {
        return options.map((province) => ({
            id: province.id,
            label: province.nameEn || province.code,
            secondaryLabel: province.nameTh || undefined,
            description: province.regionType || undefined,
            metadata: { code: province.code },
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
            title="Select Province"
            description="Search and select a province from the list"
            placeholder="Search provinces..."
            emptyText="No provinces found"
            emptyIcon={<MapPin className="h-8 w-8 mb-2" />}
        />
    )
}

interface ProvincePickerTriggerProps {
    value: string | null
    options: ProvinceOption[]
    onClick: () => void
    placeholder?: string
    className?: string
}

export function ProvincePickerTrigger({
    value,
    options,
    onClick,
    placeholder = "Select province...",
    className,
}: ProvincePickerTriggerProps) {
    const pickerOptions: PickerOption[] = useMemo(() => {
        return options.map((province) => ({
            id: province.id,
            label: province.nameEn || province.code,
            secondaryLabel: province.nameTh || undefined,
        }))
    }, [options])

    return (
        <GenericPickerTrigger
            value={value}
            options={pickerOptions}
            onClick={onClick}
            placeholder={placeholder}
            className={className}
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
    )
}
