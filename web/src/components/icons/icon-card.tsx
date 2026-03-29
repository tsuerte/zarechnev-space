"use client"

import { useMemo } from "react"

import { createCustomizedIconPreviewSvg } from "@/lib/icons/preview"
import type { IconFamilySummary } from "@/lib/icons/types"
import { cn } from "@/lib/utils"

type IconCardProps = {
  icon: IconFamilySummary
  isSelected: boolean
  onSelect: (id: string) => void
  previewSize: number
  previewStrokeWidth: number
  previewColor: string
}

export function IconCard({
  icon,
  isSelected,
  onSelect,
  previewSize,
  previewStrokeWidth,
  previewColor,
}: IconCardProps) {
  const previewSvg = useMemo(() => {
    return createCustomizedIconPreviewSvg(icon.previewSvgOptimized, {
      color: previewColor,
      strokeWidth: previewStrokeWidth,
    })
  }, [icon.previewSvgOptimized, previewColor, previewStrokeWidth])

  return (
    <button
      type="button"
      onClick={() => onSelect(icon.id)}
      aria-pressed={isSelected}
      className={cn(
        "inline-flex size-[140px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-2.5 py-2.5 text-center outline-none hover:bg-surface-soft focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isSelected && "bg-surface-soft"
      )}
    >
      <div className="flex items-center justify-center">
        <span
          aria-hidden="true"
          className="block shrink-0 text-foreground"
          style={{ width: previewSize, height: previewSize }}
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>
      <p className="line-clamp-2 w-full text-center text-xs leading-4 text-muted-foreground">
        {icon.displayName}
      </p>
    </button>
  )
}
