"use client"

import { AtSign, Smartphone, UserRound } from "lucide-react"

import { Label, ToggleGroup, ToggleGroupItem } from "@/ui-kit"
import { listZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import type { ZalivatorGeneratorId } from "@/lib/zalivator/types"

type ZalivatorGeneratorPickerProps = {
  value: ZalivatorGeneratorId
  onChange: (value: ZalivatorGeneratorId) => void
}

export function ZalivatorGeneratorPicker({
  value,
  onChange,
}: ZalivatorGeneratorPickerProps) {
  const generators = listZalivatorGeneratorMetadata()
  const generatorIcons = {
    name: UserRound,
    mobilePhone: Smartphone,
    email: AtSign,
  } as const

  return (
    <section className="space-y-2">
      <Label>Тип данных</Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue as ZalivatorGeneratorId)
          }
        }}
        variant="outline"
        spacing={1}
        className="flex w-full flex-wrap justify-start"
      >
        {generators.map((generator) => (
          <ToggleGroupItem
            key={generator.id}
            value={generator.id}
            className="gap-2 px-3"
          >
            {(() => {
              const Icon = generatorIcons[generator.id]

              return (
                <>
                  <Icon className="size-4" />
                  <span>{generator.label}</span>
                </>
              )
            })()}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
