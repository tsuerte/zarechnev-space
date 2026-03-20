"use client"

import { Input, Label, ToggleGroup, ToggleGroupItem } from "@/ui-kit"
import {
  ZALIVATOR_QUANTITY_MAX,
  ZALIVATOR_QUANTITY_MIN,
  ZALIVATOR_QUANTITY_PRESETS,
} from "@/lib/zalivator/metadata"

type ZalivatorQuantityControlProps = {
  value: number
  onChange: (value: number) => void
}

export function ZalivatorQuantityControl({
  value,
  onChange,
}: ZalivatorQuantityControlProps) {
  const selectedPreset = ZALIVATOR_QUANTITY_PRESETS.find((preset) => preset === value)

  return (
    <section className="space-y-3">
      <Label>Количество</Label>
      <div className="space-y-2.5">
        <ToggleGroup
          type="single"
          value={selectedPreset ? String(selectedPreset) : undefined}
          onValueChange={(nextValue) => {
            if (nextValue) {
              onChange(Number(nextValue))
            }
          }}
          variant="outline"
          spacing={1}
          className="flex flex-wrap justify-start"
        >
          {ZALIVATOR_QUANTITY_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset}
              value={String(preset)}
              className="px-3"
            >
              {preset}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground">Свое количество</Label>
          <Input
            type="number"
            min={ZALIVATOR_QUANTITY_MIN}
            max={ZALIVATOR_QUANTITY_MAX}
            value={value}
            onChange={(event) => {
              const nextValue = Number(event.target.value)

              if (Number.isFinite(nextValue)) {
                onChange(nextValue)
              }
            }}
            className="w-full max-w-40"
          />
        </div>
      </div>
    </section>
  )
}
