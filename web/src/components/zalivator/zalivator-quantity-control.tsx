"use client"

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"
import {
  ZALIVATOR_QUANTITY_MAX,
  ZALIVATOR_QUANTITY_MIN,
  ZALIVATOR_QUANTITY_PRESETS,
} from "@/lib/zalivator/metadata"

type ZalivatorQuantityAutoRunMode = "immediate" | "debounced"

type ZalivatorQuantityControlProps = {
  value: number
  onChange: (value: number, mode?: ZalivatorQuantityAutoRunMode) => void
}

export function ZalivatorQuantityControl({
  value,
  onChange,
}: ZalivatorQuantityControlProps) {
  const selectedPreset = ZALIVATOR_QUANTITY_PRESETS.find((preset) => preset === value)

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Количество</FieldLabel>
        <FieldContent>
          <ToggleGroup
            type="single"
            value={selectedPreset ? String(selectedPreset) : undefined}
            onValueChange={(nextValue) => {
              if (nextValue) {
                onChange(Number(nextValue), "immediate")
              }
            }}
            variant="outline"
            spacing={1}
            className="flex flex-wrap justify-start"
          >
            {ZALIVATOR_QUANTITY_PRESETS.map((preset) => (
              <ToggleGroupItem key={preset} value={String(preset)}>
                {preset}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel>Свое количество</FieldLabel>
        <FieldContent>
          <Input
            type="number"
            min={ZALIVATOR_QUANTITY_MIN}
            max={ZALIVATOR_QUANTITY_MAX}
            value={value}
            onChange={(event) => {
              if (event.target.value === "") {
                return
              }

              const nextValue = Number(event.target.value)

              if (Number.isFinite(nextValue)) {
                onChange(nextValue, "debounced")
              }
            }}
          />
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}
