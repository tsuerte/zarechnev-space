import { IconCard } from "@/components/icons/icon-card"
import type { IconFamilySummary } from "@/lib/icons/types"

type IconsGridProps = {
  icons: IconFamilySummary[]
  selectedIconId: string | null
  onSelect: (id: string) => void
  previewSize: number
  previewStrokeWidth: number
  previewColor: string
}

export function IconsGrid({
  icons,
  selectedIconId,
  onSelect,
  previewSize,
  previewStrokeWidth,
  previewColor,
}: IconsGridProps) {
  return (
    <div
      className="grid justify-start gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, 140px)" }}
    >
      {icons.map((icon) => (
        <IconCard
          key={icon.id}
          icon={icon}
          isSelected={icon.id === selectedIconId}
          onSelect={onSelect}
          previewSize={previewSize}
          previewStrokeWidth={previewStrokeWidth}
          previewColor={previewColor}
        />
      ))}
    </div>
  )
}
