"use client"

import { Check, Copy, Download, ExternalLink } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { createCustomizedIconPreviewSvg } from "@/lib/icons/preview"
import {
  createFigmaNodeUrl,
  createPublicIconFileName,
  createPublicRawIconFileName,
  type IconFamilyDetail,
} from "@/lib/icons/types"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"

type IconDetailPanelProps = {
  icon: IconFamilyDetail | null
  isLoading: boolean
  error: string | null
  previewSize: number
  previewStrokeWidth: number
  previewColor: string
}

function downloadSvg(fileName: string, svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function formatMetaDateTime(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

export function IconDetailPanel({
  icon,
  isLoading,
  error,
  previewSize,
  previewStrokeWidth,
  previewColor,
}: IconDetailPanelProps) {
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

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

  const previewSvg = useMemo(() => {
    if (!selectedVariant) {
      return null
    }

    return createCustomizedIconPreviewSvg(selectedVariant.svgOptimized, {
      color: previewColor,
      strokeWidth: previewStrokeWidth,
    })
  }, [previewColor, previewStrokeWidth, selectedVariant])

  useEffect(() => {
    if (!feedbackKey) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackKey((currentKey) => (currentKey === feedbackKey ? null : currentKey))
    }, 1400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [feedbackKey])

  if (error) {
    return (
      <Card size="sm" className="h-full w-full rounded-none border-0">
        <CardHeader className="border-b">
          <CardTitle>Не удалось загрузить детали</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading && !icon) {
    return (
      <Card size="sm" className="h-full w-full rounded-none border-0">
        <CardHeader className="border-b">
          <CardTitle>Загружаем детали</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            Подготавливаем optimized и raw SVG для выбранной иконки.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!icon) {
    return (
      <Card size="sm" className="h-full w-full rounded-none border-0">
        <CardHeader className="border-b">
          <CardTitle>Детали иконки</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full items-center justify-center pt-4">
          <div className="max-w-[180px] text-center">
            <p className="text-sm text-foreground">Выбери иконку в сетке</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Здесь появятся превью, варианты и действия для SVG.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedVariant || !previewSvg) {
    return null
  }

  const figmaUrl = createFigmaNodeUrl(icon.figmaFileKey, icon.familyNodeId)
  const optimizedSvg = selectedVariant.svgOptimized
  const rawSvg = selectedVariant.svgSource
  const optimizedFileName = createPublicIconFileName(icon.displayName, selectedVariant.label)
  const rawFileName = createPublicRawIconFileName(icon.displayName, selectedVariant.label)
  const showGroup = Boolean(
    icon.group &&
      icon.group !== icon.displayName &&
      icon.group.trim().toLowerCase() !== "icons"
  )
  const showVariantLabel = icon.variants.length === 1 && selectedVariant.label !== "Default"
  const syncedAtLabel = formatMetaDateTime(icon.lastSyncedAt)
  const updatedAtLabel = formatMetaDateTime(icon.updatedAt)
  const showUpdatedAtLabel = Boolean(updatedAtLabel && updatedAtLabel !== syncedAtLabel)

  function scheduleFeedback(nextKey: string) {
    setFeedbackKey(nextKey)
  }

  async function handleCopy(svg: string, key: string) {
    await navigator.clipboard.writeText(svg)
    scheduleFeedback(key)
  }

  function handleDownload(fileName: string, svg: string, key: string) {
    downloadSvg(fileName, svg)
    scheduleFeedback(key)
  }

  const actionItems: Array<{
    key: string
    title: string
    icon: typeof Check
    variant: "outline" | "muted"
    ariaLabel: string
    onClick: () => void
  }> = [
    {
      key: "copy-svg",
      title: "SVG",
      icon: feedbackKey === "copy-svg" ? Check : Copy,
      variant: feedbackKey === "copy-svg" ? "muted" : "outline",
      ariaLabel: "Копировать SVG",
      onClick: () => void handleCopy(optimizedSvg, "copy-svg"),
    },
    {
      key: "copy-svg-raw",
      title: "SVG Raw",
      icon: feedbackKey === "copy-svg-raw" ? Check : Copy,
      variant: feedbackKey === "copy-svg-raw" ? "muted" : "outline",
      ariaLabel: "Копировать SVG Raw",
      onClick: () => void handleCopy(rawSvg, "copy-svg-raw"),
    },
    {
      key: "download-svg",
      title: "SVG",
      icon: feedbackKey === "download-svg" ? Check : Download,
      variant: feedbackKey === "download-svg" ? "muted" : "outline",
      ariaLabel: "Скачать SVG",
      onClick: () => handleDownload(optimizedFileName, optimizedSvg, "download-svg"),
    },
    {
      key: "download-svg-raw",
      title: "SVG Raw",
      icon: feedbackKey === "download-svg-raw" ? Check : Download,
      variant: feedbackKey === "download-svg-raw" ? "muted" : "outline",
      ariaLabel: "Скачать SVG Raw",
      onClick: () => handleDownload(rawFileName, rawSvg, "download-svg-raw"),
    },
  ]

  return (
    <Card size="sm" className="h-full w-full rounded-none border-0">
      <CardContent className="flex h-full flex-col gap-5 pt-4">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
          <section className="space-y-4">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="flex aspect-square w-full max-w-40 items-center justify-center rounded-2xl bg-surface-soft p-6 xl:max-w-none">
                  <span
                    aria-hidden="true"
                    className="block shrink-0 text-foreground"
                    style={{ width: previewSize, height: previewSize }}
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {showGroup ? (
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {icon.group}
                  </p>
                ) : null}
                <CardTitle className="text-lg leading-tight">{icon.displayName}</CardTitle>
                {showVariantLabel ? (
                  <p className="text-sm text-muted-foreground">{selectedVariant.label}</p>
                ) : null}
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              {syncedAtLabel ? (
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Синк</dt>
                  <dd className="font-medium text-foreground">{syncedAtLabel}</dd>
                </div>
              ) : null}

              {showUpdatedAtLabel ? (
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Обновлено</dt>
                  <dd className="font-medium text-foreground">{updatedAtLabel}</dd>
                </div>
              ) : null}

              <div className="space-y-1">
                <dt className="text-muted-foreground">Источник</dt>
                <dd>
                  {figmaUrl ? (
                    <Button asChild variant="link" size="sm" className="h-auto px-0">
                      <a href={figmaUrl} target="_blank" rel="noreferrer">
                        Figma
                        <ExternalLink data-icon="inline-end" />
                      </a>
                    </Button>
                  ) : (
                    <span className="font-medium text-foreground">Figma</span>
                  )}
                </dd>
              </div>
            </dl>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Обновляем детали...</p>
            ) : null}
          </section>

          {icon.variants.length > 1 ? (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Варианты
              </p>
              <ToggleGroup
                type="single"
                value={selectedVariant.id}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedVariantId(value)
                  }
                }}
                variant="outline"
                size="sm"
                className="flex-wrap"
              >
                {icon.variants.map((variant) => (
                  <ToggleGroupItem key={variant.id} value={variant.id}>
                    {variant.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </section>
          ) : null}

          <section className="grid grid-cols-2 gap-2">
            {actionItems.map((actionItem) => (
              <Item
                key={actionItem.key}
                asChild
                variant={actionItem.variant}
                size="sm"
                className="cursor-pointer text-left hover:bg-muted/60"
              >
                <button
                  type="button"
                  onClick={actionItem.onClick}
                  aria-label={actionItem.ariaLabel}
                >
                  <ItemMedia variant="icon">
                    <actionItem.icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{actionItem.title}</ItemTitle>
                  </ItemContent>
                </button>
              </Item>
            ))}
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
