"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"

import { IconDetailPanel } from "@/components/icons/icon-detail-panel"
import { IconsGrid } from "@/components/icons/icons-grid"
import { IconsToolbar } from "@/components/icons/icons-toolbar"
import { DEFAULT_ICON_PREVIEW_COLOR } from "@/lib/icons/preview"
import type { IconFamilyDetail, IconFamilySummary } from "@/lib/icons/types"

type IconsWorkspaceProps = {
  initialIcons: IconFamilySummary[]
  initialCatalogSyncedAt: string | null
}

export function IconsWorkspace({
  initialIcons,
  initialCatalogSyncedAt,
}: IconsWorkspaceProps) {
  const [previewSize, setPreviewSize] = useState(24)
  const [previewStrokeWidth, setPreviewStrokeWidth] = useState(1.5)
  const [previewColor, setPreviewColor] = useState(DEFAULT_ICON_PREVIEW_COLOR)
  const deferredPreviewColor = useDeferredValue(previewColor)
  const [query, setQuery] = useState("")
  const [selectedIconId, setSelectedIconId] = useState<string | null>(initialIcons[0]?.id ?? null)
  const [selectedIcon, setSelectedIcon] = useState<IconFamilyDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(Boolean(initialIcons[0]))
  const [detailError, setDetailError] = useState<string | null>(null)

  async function loadIconDetail(iconId: string, signal: AbortSignal) {
    const response = await fetch(`/api/icons/${encodeURIComponent(iconId)}`, {
      method: "GET",
      signal,
    })

    const payload = (await response.json()) as {
      icon: IconFamilyDetail | null
      error: string | null
    }

    if (!response.ok || !payload.icon) {
      throw new Error(payload.error ?? "Не удалось загрузить детали иконки.")
    }

    return payload.icon
  }

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return initialIcons
    }

    return initialIcons.filter((icon) => {
      const haystack = [icon.fullName, icon.displayName, icon.group ?? ""]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [initialIcons, query])

  useEffect(() => {
    if (!filteredIcons.length) {
      setSelectedIconId(null)
      return
    }

    if (!selectedIconId || !filteredIcons.some((icon) => icon.id === selectedIconId)) {
      setSelectedIconId(filteredIcons[0].id)
    }
  }, [filteredIcons, selectedIconId])

  useEffect(() => {
    if (!selectedIconId) {
      setDetailError(null)
      setIsDetailLoading(false)
      return
    }

    const iconId = selectedIconId

    if (selectedIcon?.id === selectedIconId) {
      return
    }

    const abortController = new AbortController()

    async function syncSelectedIcon() {
      setIsDetailLoading(true)
      setDetailError(null)
      setSelectedIcon(null)

      try {
        const icon = await loadIconDetail(iconId, abortController.signal)
        setSelectedIcon(icon)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setSelectedIcon(null)
        setDetailError(
          error instanceof Error ? error.message : "Не удалось загрузить детали иконки."
        )
      } finally {
        if (!abortController.signal.aborted) {
          setIsDetailLoading(false)
        }
      }
    }

    void syncSelectedIcon()

    return () => {
      abortController.abort()
    }
  }, [selectedIcon, selectedIconId])

  const visibleSelectedIcon =
    selectedIconId && selectedIcon?.id === selectedIconId ? selectedIcon : null

  const handleSelectIcon = useCallback((iconId: string) => {
    setSelectedIconId(iconId)
  }, [])

  return (
    <main className="flex h-full min-h-0 w-full flex-col">
      <section className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 min-w-0 flex-col px-6 pb-6">
          <div className="space-y-2 py-6">
            <h1 className="text-3xl font-semibold tracking-tight">Иконки</h1>
            <p className="text-base text-muted-foreground">
              Публичная витрина канонических SVG-иконок, синхронизированных из Figma page.
            </p>
          </div>

          <IconsToolbar
            query={query}
            onQueryChange={setQuery}
            previewSize={previewSize}
            onPreviewSizeChange={setPreviewSize}
            previewStrokeWidth={previewStrokeWidth}
            onPreviewStrokeWidthChange={setPreviewStrokeWidth}
            previewColor={previewColor}
            onPreviewColorChange={setPreviewColor}
            syncedAt={initialCatalogSyncedAt}
          />

          <div className="min-h-0 flex-1 overflow-y-auto pt-6">
            {filteredIcons.length > 0 ? (
              <IconsGrid
                icons={filteredIcons}
                selectedIconId={selectedIconId}
                onSelect={handleSelectIcon}
                previewSize={previewSize}
                previewStrokeWidth={previewStrokeWidth}
                previewColor={deferredPreviewColor}
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-foreground">Иконки не найдены</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Попробуй другой запрос или очисти поиск.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="min-h-0 min-w-0 border-t border-t-border/20 bg-background xl:h-full xl:border-t-0 xl:border-l xl:border-l-border/15">
          <div className="px-6 py-4 xl:h-full xl:px-0 xl:py-0">
            <div className="mx-auto w-full max-w-sm xl:h-full xl:max-w-none">
              <IconDetailPanel
                icon={visibleSelectedIcon}
                isLoading={isDetailLoading}
                error={detailError}
                previewSize={previewSize}
                previewStrokeWidth={previewStrokeWidth}
                previewColor={deferredPreviewColor}
              />
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
