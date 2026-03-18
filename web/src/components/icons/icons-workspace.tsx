"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"

import { loadIconDetailAction } from "@/app/lab/icons/actions"
import { IconDetailPanel } from "@/components/icons/icon-detail-panel"
import { IconsGrid } from "@/components/icons/icons-grid"
import { IconsToolbar } from "@/components/icons/icons-toolbar"
import { DEFAULT_ICON_PREVIEW_COLOR } from "@/lib/icons/preview"
import type { IconFamilyDetail, IconFamilySummary } from "@/lib/icons/types"

type IconsWorkspaceProps = {
  initialIcons: IconFamilySummary[]
  initialCatalogSyncedAt: string | null
  initialSelectedIcon: IconFamilyDetail | null
}

export function IconsWorkspace({
  initialIcons,
  initialCatalogSyncedAt,
  initialSelectedIcon,
}: IconsWorkspaceProps) {
  const [previewSize, setPreviewSize] = useState(24)
  const [previewStrokeWidth, setPreviewStrokeWidth] = useState(1.5)
  const [previewColor, setPreviewColor] = useState(DEFAULT_ICON_PREVIEW_COLOR)
  const deferredPreviewColor = useDeferredValue(previewColor)
  const [query, setQuery] = useState("")
  const [selectedIconId, setSelectedIconId] = useState<string | null>(
    initialSelectedIcon?.id ?? initialIcons[0]?.id ?? null
  )
  const [selectedIcon, setSelectedIcon] = useState<IconFamilyDetail | null>(initialSelectedIcon)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

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
      setSelectedIconId(filteredIcons[0]?.id ?? null)
    }
  }, [filteredIcons, selectedIconId])

  useEffect(() => {
    if (!selectedIconId) {
      setSelectedIcon(null)
      setDetailError(null)
      setIsDetailLoading(false)
      return
    }

    const iconId = selectedIconId

    if (selectedIcon?.id === selectedIconId) {
      return
    }

    let cancelled = false

    async function loadIconDetail() {
      setIsDetailLoading(true)
      setDetailError(null)

      try {
        const payload = await loadIconDetailAction(iconId)

        if (!payload.icon) {
          throw new Error(payload.error ?? "Не удалось загрузить детали иконки.")
        }

        if (!cancelled) {
          setSelectedIcon(payload.icon)
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedIcon(null)
          setDetailError(
            error instanceof Error ? error.message : "Не удалось загрузить детали иконки."
          )
        }
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false)
        }
      }
    }

    void loadIconDetail()

    return () => {
      cancelled = true
    }
  }, [selectedIcon, selectedIconId])

  return (
    <main className="flex h-full min-h-0 w-full">
      <section className="flex min-w-0 flex-1 flex-col space-y-6 px-6 pb-6">
        <div className="space-y-2 pt-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredIcons.length > 0 ? (
            <IconsGrid
              icons={filteredIcons}
              selectedIconId={selectedIconId}
              onSelect={setSelectedIconId}
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
      </section>

      <IconDetailPanel
        icon={selectedIcon}
        isLoading={isDetailLoading}
        error={detailError}
        previewSize={previewSize}
        previewStrokeWidth={previewStrokeWidth}
        previewColor={deferredPreviewColor}
      />
    </main>
  )
}
