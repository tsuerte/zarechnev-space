"use client"

import { useState } from "react"

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"
import { getZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import type {
  ZalivatorGenerateResponse,
  ZalivatorGeneratorId,
  ZalivatorOptionField,
} from "@/lib/zalivator/types"
import { ZalivatorGeneratorPicker } from "@/components/zalivator/zalivator-generator-picker"
import { ZalivatorQuantityControl } from "@/components/zalivator/zalivator-quantity-control"
import { ZalivatorResultList } from "@/components/zalivator/zalivator-result-list"

function buildDefaultOptions(generator: ZalivatorGeneratorId) {
  const metadata = getZalivatorGeneratorMetadata(generator)
  const defaults: Record<string, string> = {}

  for (const field of metadata.optionFields) {
    if (field.control === "segmented") {
      defaults[field.key] = field.options[0]?.value ?? ""
    }
  }

  return defaults
}

function renderOptionField(
  field: ZalivatorOptionField,
  value: unknown,
  onChange: (key: string, value: string) => void
) {
  if (field.control === "segmented") {
    return (
      <div key={field.key} className="space-y-2">
        <Label>{field.label}</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={1}
          value={typeof value === "string" ? value : undefined}
          onValueChange={(nextValue) => {
            if (nextValue) {
              onChange(field.key, nextValue)
            }
          }}
          className="flex flex-wrap justify-start"
        >
          {field.options.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} className="px-3">
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    )
  }

  return (
    <div key={field.key} className="space-y-2">
      <Label>{field.label}</Label>
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(field.key, event.target.value)}
        placeholder={field.placeholder}
        inputMode={field.inputMode}
      />
    </div>
  )
}

export function ZalivatorWorkspace() {
  const [generator, setGenerator] = useState<ZalivatorGeneratorId>("name")
  const [quantity, setQuantity] = useState(10)
  const [unique, setUnique] = useState(false)
  const [options, setOptions] = useState<Record<string, string>>(() => buildDefaultOptions("name"))
  const [result, setResult] = useState<ZalivatorGenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const metadata = getZalivatorGeneratorMetadata(generator)

  const handleGeneratorChange = (nextGenerator: ZalivatorGeneratorId) => {
    setGenerator(nextGenerator)
    setOptions(buildDefaultOptions(nextGenerator))
    setUnique(false)
    setResult(null)
    setError(null)
  }

  const handleOptionChange = (key: string, nextValue: string) => {
    setOptions((current) => ({
      ...current,
      [key]: nextValue,
    }))
  }

  const handleGenerate = async () => {
    setIsPending(true)
    setError(null)

    try {
      const payloadOptions = Object.fromEntries(
        Object.entries(options).filter(([, value]) => value.trim() !== "")
      )

      const response = await fetch("/api/zalivator/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generator,
          quantity,
          unique,
          options: payloadOptions,
        }),
      })

      const payload = (await response.json()) as ZalivatorGenerateResponse | { error: string }

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Не удалось сгенерировать значения.")
      }

      setResult(payload)
    } catch (cause) {
      setResult(null)
      setError(cause instanceof Error ? cause.message : "Не удалось сгенерировать значения.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-6 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden">
      <Card className="h-fit">
        <CardContent className="space-y-5 p-6">
          <ZalivatorGeneratorPicker value={generator} onChange={handleGeneratorChange} />

          {generator === "uuidV7" ? (
            <p className="text-sm leading-5 text-muted-foreground">
              RFC 9562 UUID v7 с Unix timestamp в миллисекундах, корректным variant и time-ordered batch-поведением.
            </p>
          ) : null}

          {metadata.optionFields.length > 0 ? (
            <>
              <Separator />
              <section className="space-y-4">
                {metadata.optionFields.map((field) =>
                  renderOptionField(field, options[field.key], handleOptionChange)
                )}
              </section>
            </>
          ) : null}

          <Separator />
          <ZalivatorQuantityControl value={quantity} onChange={setQuantity} />

          {metadata.supportsUnique ? (
            <section className="flex items-start gap-3">
              <Checkbox
                id="zalivator-unique"
                checked={unique}
                onCheckedChange={(checked) => setUnique(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="zalivator-unique">Только уникальные</Label>
                <p className="text-sm leading-5 text-muted-foreground">
                  Значения не будут повторяться внутри одного набора.
                </p>
              </div>
            </section>
          ) : null}

          <Button onClick={handleGenerate} disabled={isPending} className="w-full">
            {isPending ? "Генерация..." : "Сгенерировать"}
          </Button>

          {error ? <p className="text-sm leading-5 text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ZalivatorResultList result={result} />
      </section>
    </main>
  )
}
