"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  defaultValue?: number[]
  max?: number
  min?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, defaultValue, max = 100, min = 0, step = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
      value?.[0] ?? defaultValue?.[0] ?? min
    )

    React.useEffect(() => {
      if (value?.[0] !== undefined) {
        setInternalValue(value[0])
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value)
      setInternalValue(newValue)
      onValueChange?.([newValue])
    }

    return (
      <div className="relative flex w-full touch-none select-none items-center">
        <input
          type="range"
          ref={ref}
          className={cn(
            "flex h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none",
            className
          )}
          value={internalValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }