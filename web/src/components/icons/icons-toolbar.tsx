import { Search } from "lucide-react"

import { Input, Tabs, TabsList, TabsTrigger } from "@/ui-kit"

const PREVIEW_SIZES = [16, 24, 32] as const
type PreviewSize = (typeof PREVIEW_SIZES)[number]

type IconsToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  previewSize: PreviewSize
  onPreviewSizeChange: (size: PreviewSize) => void
  syncedAt: string | null
}

export function IconsToolbar({
  query,
  onQueryChange,
  previewSize,
  onPreviewSizeChange,
  syncedAt,
}: IconsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск иконок..."
            className="pl-9"
          />
        </div>
        <Tabs
          size="sm"
          value={String(previewSize)}
          onValueChange={(value) => {
            const nextValue = Number(value)

            if (
              nextValue === PREVIEW_SIZES[0] ||
              nextValue === PREVIEW_SIZES[1] ||
              nextValue === PREVIEW_SIZES[2]
            ) {
              onPreviewSizeChange(nextValue)
            }
          }}
        >
          <TabsList>
            {PREVIEW_SIZES.map((size) => (
              <TabsTrigger key={size} value={String(size)}>
                {size}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <p className="text-xs text-muted-foreground">
        {syncedAt
          ? `Последний sync: ${new Date(syncedAt).toLocaleString("ru-RU")}`
          : "Каталог ещё не синхронизирован."}
      </p>
    </div>
  )
}
