"use client"

import Image from "next/image"

import type { IconFamilySummary } from "@/lib/icons/types"
import { cn } from "@/lib/utils"
import { Badge, Button } from "@/ui-kit"

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

type IconCardProps = {
  icon: IconFamilySummary
  isSelected: boolean
  onSelect: (id: string) => void
  previewSize: number
}

export function IconCard({ icon, isSelected, onSelect, previewSize }: IconCardProps) {
  const stageSize = Math.max(previewSize, 48)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(icon.id)}
      className={cn(
        "h-auto min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent bg-transparent px-3 py-4 text-center hover:bg-surface-soft",
        isSelected && "bg-surface-soft"
      )}
    >
      <div className="flex items-center justify-center" style={{ minHeight: stageSize }}>
        <Image
          src={svgToDataUrl(icon.previewSvgOptimized)}
          alt={icon.displayName}
          width={previewSize}
          height={previewSize}
          unoptimized
          className="object-contain text-foreground"
          style={{ width: previewSize, height: previewSize }}
        />
      </div>
      <div className="flex min-h-8 w-full items-start justify-center gap-1.5">
        <p className="min-w-0 text-center text-xs leading-4 text-muted-foreground">
          {icon.displayName}
        </p>
        {icon.syncStatus === "sync-error" ? (
          <Badge variant="secondary">Sync error</Badge>
        ) : null}
      </div>
    </Button>
  )
}
