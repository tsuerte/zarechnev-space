"use client"

import {
  AtSign,
  Building2,
  CreditCard,
  FileDigit,
  Fingerprint,
  IdCard,
  BriefcaseBusiness,
  Smartphone,
  UserRound,
} from "lucide-react"

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui-kit"
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
    snils: IdCard,
    city: Building2,
    organizationName: Building2,
    inn: FileDigit,
    kpp: CreditCard,
    position: BriefcaseBusiness,
    uuidV7: Fingerprint,
  } as const

  return (
    <section className="space-y-2.5">
      <Label>Тип данных</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as ZalivatorGeneratorId)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Выбери тип данных" />
        </SelectTrigger>
        <SelectContent>
          {generators.map((generator) => {
            const Icon = generatorIcons[generator.id]

            return (
              <SelectItem key={generator.id} value={generator.id}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{generator.label}</span>
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </section>
  )
}
