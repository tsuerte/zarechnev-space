"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type ChoiceListOption = {
  value: string
  label: React.ReactNode
}

type ChoiceListProps = {
  value?: string
  options: ChoiceListOption[]
  onValueChange: (value: string) => void
  className?: string
  showIndex?: boolean
}

function ChoiceList({
  value,
  options,
  onValueChange,
  className,
  showIndex = false,
}: ChoiceListProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "rounded-xl border border-input bg-background px-1 py-2",
        className
      )}
    >
      {options.map((option, index) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-1 text-left text-sm leading-5 transition-colors",
              "hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive && "bg-accent"
            )}
          >
            {showIndex ? (
              <span className="w-4 shrink-0 text-muted-foreground tabular-nums">
                {index + 1}
              </span>
            ) : null}
            <span className="min-w-0 flex-1">{option.label}</span>
            <Check
              className={cn(
                "size-4 shrink-0 text-primary transition-opacity",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export { ChoiceList }
