"use client"

import * as React from "react"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
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
    const t = useTranslations("companies_lookup.smartFiltering")

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
            title={t("selectProvinceTitle")}
            description={t("selectProvinceDescription")}
            placeholder={t("provincePlaceholder")}
            emptyText={t("noProvincesFound")}
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
    placeholder,
    className,
}: ProvincePickerTriggerProps) {
    const t = useTranslations("companies_lookup.smartFiltering")
    const pickerOptions: PickerOption[] = useMemo(() => {
        return options.map((province) => ({
            id: province.id,
            label: province.nameEn || province.code,
            secondaryLabel: province.nameTh || undefined,
        }))
    }, [options])

    const effectivePlaceholder = placeholder ?? t("provincePlaceholder")

    return (
        <GenericPickerTrigger
            value={value}
            options={pickerOptions}
            onClick={onClick}
            placeholder={effectivePlaceholder}
            className={className}
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
    )
}
