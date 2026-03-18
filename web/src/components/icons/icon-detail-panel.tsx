"use client"

import { Copy, Download, FileCode2 } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

import {
  createFigmaNodeUrl,
  createPublicIconFileName,
  type IconFamilyDetail,
} from "@/lib/icons/types"
import { createSvgPreviewUrl } from "@/lib/svg/client"
import { Badge, Button, Separator } from "@/ui-kit"

function downloadSvg(fileName: string, svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

type IconDetailPanelProps = {
  icon: IconFamilyDetail | null
  isLoading: boolean
  error: string | null
  previewSize: number
}

export function IconDetailPanel({
  icon,
  isLoading,
  error,
  previewSize,
}: IconDetailPanelProps) {
  const [copied, setCopied] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    icon?.variants[0]?.id ?? null
  )
  const resolvedVariantId =
    icon && selectedVariantId && icon.variants.some((variant) => variant.id === selectedVariantId)
      ? selectedVariantId
      : icon?.variants[0]?.id ?? null

  const selectedVariant = useMemo(() => {
    if (!icon) {
      return null
    }

    return (
      icon.variants.find((variant) => variant.id === resolvedVariantId) ?? icon.variants[0] ?? null
    )
  }, [icon, resolvedVariantId])

  async function handleCopy() {
    if (!selectedVariant) {
      return
    }

    await navigator.clipboard.writeText(selectedVariant.svgOptimized)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  if (error) {
    return (
      <aside className="w-[360px] shrink-0 border-l bg-background">
        <div className="flex h-full items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </aside>
    )
  }

  if (!icon || !selectedVariant) {
    return (
      <aside className="w-[360px] shrink-0 border-l bg-background">
        <div className="flex h-full items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Выберите иконку, чтобы посмотреть детали.</p>
        </div>
      </aside>
    )
  }

  const figmaUrl = createFigmaNodeUrl(icon.figmaFileKey, icon.familyNodeId)
  const downloadName = createPublicIconFileName(icon.displayName, selectedVariant.label)

  return (
    <aside className="w-[360px] shrink-0 border-l bg-background">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg leading-7 text-foreground">{icon.displayName}</h2>
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <p className="text-xs text-muted-foreground">Обновляем...</p>
              ) : null}
              <Badge variant={icon.syncStatus === "synced" ? "outline" : "secondary"}>
                {icon.syncStatus === "synced" ? "Synced" : "Sync error"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Предпросмотр</p>
            <div className="mt-3 flex aspect-square items-center justify-center rounded-2xl bg-surface-soft p-8">
              <div
                className="flex items-center justify-center"
                style={{ width: previewSize, height: previewSize }}
              >
                <Image
                  src={createSvgPreviewUrl(selectedVariant.svgOptimized)}
                  alt={icon.displayName}
                  width={previewSize}
                  height={previewSize}
                  unoptimized
                  className="object-contain"
                  style={{ width: previewSize, height: previewSize }}
                />
              </div>
            </div>
          </div>

          {icon.variants.length > 1 ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Variants</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {icon.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={variant.id === selectedVariant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex gap-2">
            <Button className="flex-1 gap-2" onClick={handleCopy}>
              <Copy className="size-4" />
              {copied ? "Скопировано" : "Копировать SVG"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => downloadSvg(downloadName, selectedVariant.svgOptimized)}
            >
              <Download className="size-4" />
              Скачать
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-5">
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Figma</p>
                <a
                  href={figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-sm text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary"
                >
                  Открыть source node
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Полное имя
                </p>
                <p className="mt-1 text-sm text-foreground">{icon.fullName}</p>
              </div>
            </div>

            <div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Synced
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {icon.lastSyncedAt
                    ? new Date(icon.lastSyncedAt).toLocaleString("ru-RU")
                    : "Ещё не синхронизировано"}
                </p>
              </div>
            </div>

            {icon.lastSyncError ? (
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Last sync error
                </p>
                <p className="mt-1 text-sm text-foreground">{icon.lastSyncError}</p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Канонический SVG
              </p>
              <div className="mt-2 rounded-lg border bg-background p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileCode2 className="size-4" />
                  {selectedVariant.label}
                </div>
                <code className="line-clamp-5 block whitespace-pre-wrap break-all text-[11px] leading-5 text-muted-foreground">
                  {selectedVariant.svgOptimized}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
