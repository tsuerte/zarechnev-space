import { Search } from "lucide-react"

import {
  DEFAULT_ICON_PREVIEW_COLOR,
  ICON_DETAIL_PREVIEW_SIZE_MAX,
  ICON_DETAIL_PREVIEW_SIZE_MIN,
  ICON_DETAIL_PREVIEW_SIZE_STEP,
  ICON_DETAIL_PREVIEW_STROKE_MAX,
  ICON_DETAIL_PREVIEW_STROKE_MIN,
  ICON_DETAIL_PREVIEW_STROKE_STEP,
} from "@/lib/icons/preview"
import { Input, Slider } from "@/ui-kit"

function getColorChipTextColor(hex: string) {
  const normalized = hex.replace("#", "")
  if (!/^[\da-fA-F]{6}$/.test(normalized)) {
    return "#FFFFFF"
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.7 ? "#121212" : "#FFFFFF"
}

type IconsToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  previewSize: number
  onPreviewSizeChange: (size: number) => void
  previewStrokeWidth: number
  onPreviewStrokeWidthChange: (strokeWidth: number) => void
  previewColor: string
  onPreviewColorChange: (color: string) => void
  syncedAt: string | null
}

export function IconsToolbar({
  query,
  onQueryChange,
  previewSize,
  onPreviewSizeChange,
  previewStrokeWidth,
  onPreviewStrokeWidthChange,
  previewColor,
  onPreviewColorChange,
  syncedAt,
}: IconsToolbarProps) {
  const currentPreviewColor = (previewColor || DEFAULT_ICON_PREVIEW_COLOR).toUpperCase()

  return (
    <div className="flex flex-col gap-3 border-b pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 basis-full sm:basis-[220px] sm:flex-none">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск иконок..."
            className="pl-9"
          />
        </div>

        <div className="flex min-w-[220px] flex-1 items-center gap-2 sm:min-w-[240px] lg:flex-none lg:basis-[280px]">
          <span className="shrink-0 text-sm leading-5 text-muted-foreground">Размер</span>
          <Slider
            id="icons-preview-size"
            min={ICON_DETAIL_PREVIEW_SIZE_MIN}
            max={ICON_DETAIL_PREVIEW_SIZE_MAX}
            step={ICON_DETAIL_PREVIEW_SIZE_STEP}
            value={[previewSize]}
            onValueChange={([value]) => {
              if (typeof value === "number") {
                onPreviewSizeChange(value)
              }
            }}
            className="min-w-0 flex-1"
            aria-label="Размер превью иконок"
          />
          <span className="w-[18px] shrink-0 text-right text-sm leading-5 text-foreground">{previewSize}</span>
        </div>

        <div className="flex min-w-[220px] flex-1 items-center gap-2 sm:min-w-[240px] lg:flex-none lg:basis-[280px]">
          <span className="shrink-0 text-sm leading-5 text-muted-foreground">Толщина</span>
          <Slider
            id="icons-preview-stroke"
            min={ICON_DETAIL_PREVIEW_STROKE_MIN}
            max={ICON_DETAIL_PREVIEW_STROKE_MAX}
            step={ICON_DETAIL_PREVIEW_STROKE_STEP}
            value={[previewStrokeWidth]}
            onValueChange={([value]) => {
              if (typeof value === "number") {
                onPreviewStrokeWidthChange(value)
              }
            }}
            className="min-w-0 flex-1"
            aria-label="Толщина stroke превью иконок"
          />
          <span className="w-[22px] shrink-0 text-right text-sm leading-5 text-foreground">
            {previewStrokeWidth}
          </span>
        </div>

        <label
          htmlFor="icons-preview-color"
          className="relative inline-flex h-8 w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-md text-center text-sm leading-5 font-medium"
          style={{
            backgroundColor: currentPreviewColor,
            color: getColorChipTextColor(currentPreviewColor),
          }}
        >
          <input
            id="icons-preview-color"
            type="color"
            value={previewColor}
            onChange={(event) => onPreviewColorChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Цвет превью иконок"
          />
          <span>{currentPreviewColor}</span>
        </label>

        <p className="basis-full text-xs text-muted-foreground lg:ml-auto lg:basis-auto lg:text-right">
          {syncedAt
            ? `Последний синк: ${new Date(syncedAt).toLocaleString("ru-RU")}`
            : "Каталог ещё не синхронизирован."}
        </p>
      </div>
    </div>
  )
}
