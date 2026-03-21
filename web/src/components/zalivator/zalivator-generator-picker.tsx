"use client"

import {
  AtSign,
  Building2,
  CreditCard,
  FileDigit,
  Fingerprint,
  IdCard,
  BriefcaseBusiness,
  Ruler,
  Smartphone,
  UserRound,
} from "lucide-react"

import { listZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import { cn } from "@/lib/utils"
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
    measurement: Ruler,
  } as const

  return (
    <nav className="space-y-1 px-2 py-2" aria-label="Типы данных Zalivator">
      {generators.map((generator) => {
        const Icon = generatorIcons[generator.id]
        const isActive = generator.id === value

        return (
          <button
            key={generator.id}
            type="button"
            onClick={() => onChange(generator.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-pressed={isActive}
          >
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{generator.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
