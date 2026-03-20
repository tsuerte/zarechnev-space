"use client"

import { type ReactNode, useState } from "react"

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  ChoiceList,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"
import { getZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import type {
  ZalivatorGenerateResponse,
  ZalivatorGeneratorId,
  ZalivatorOptionChoice,
  ZalivatorOptionField,
} from "@/lib/zalivator/types"
import { ZalivatorGeneratorPicker } from "@/components/zalivator/zalivator-generator-picker"
import { ZalivatorQuantityControl } from "@/components/zalivator/zalivator-quantity-control"
import { ZalivatorResultList } from "@/components/zalivator/zalivator-result-list"

type ZalivatorOptionValue = string | string[]

function resolveFieldChoices(
  field: ZalivatorOptionField,
  currentValues: Record<string, ZalivatorOptionValue>
): ZalivatorOptionChoice[] {
  if (field.control !== "checkbox-group") {
    return []
  }

  if (field.options) {
    return field.options
  }

  if (field.optionsByValue && field.dependsOn) {
    const dependencyValue = currentValues[field.dependsOn]

    if (typeof dependencyValue === "string") {
      return field.optionsByValue[dependencyValue] ?? []
    }
  }

  return []
}

function isFieldVisible(
  field: ZalivatorOptionField,
  currentValues: Record<string, ZalivatorOptionValue>
) {
  if (field.hiddenWhen && currentValues[field.hiddenWhen.key] === field.hiddenWhen.value) {
    return false
  }

  if (!field.visibleWhen) {
    return true
  }

  return currentValues[field.visibleWhen.key] === field.visibleWhen.value
}

function buildDefaultOptions(generator: ZalivatorGeneratorId) {
  const metadata = getZalivatorGeneratorMetadata(generator)
  const defaults: Record<string, ZalivatorOptionValue> = {}

  for (const field of metadata.optionFields) {
    if (field.control === "segmented") {
      defaults[field.key] = field.options[0]?.value ?? ""
      continue
    }

    if (field.control === "select") {
      defaults[field.key] = field.options[0]?.value ?? ""
      continue
    }

    if (field.control === "text" || field.control === "textarea" || field.control === "number") {
      defaults[field.key] = field.defaultValue ?? ""
      continue
    }

    if (field.control === "checkbox-group") {
      defaults[field.key] = resolveFieldChoices(field, defaults).map((option) => option.value)
    }
  }

  return defaults
}

function renderOptionField(
  field: ZalivatorOptionField,
  value: unknown,
  currentValues: Record<string, ZalivatorOptionValue>,
  onChange: (key: string, value: ZalivatorOptionValue) => void
) {
  if (!isFieldVisible(field, currentValues)) {
    return null
  }

  if (field.control === "segmented") {
    if (field.options.length > 4) {
      return (
        <div key={field.key} className="space-y-2.5">
          <Label>{field.label}</Label>
          <ChoiceList
            value={typeof value === "string" ? value : undefined}
            onValueChange={(nextValue) => onChange(field.key, nextValue)}
            options={field.options}
          />
        </div>
      )
    }

    return (
      <div key={field.key} className="space-y-2.5">
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

  if (field.control === "select") {
    if (field.options.length > 4) {
      return (
        <div key={field.key} className="space-y-2.5">
          <Label>{field.label}</Label>
          <ChoiceList
            value={typeof value === "string" ? value : undefined}
            onValueChange={(nextValue) => onChange(field.key, nextValue)}
            options={field.options}
          />
        </div>
      )
    }

    return (
      <div key={field.key} className="space-y-2.5">
        <Label>{field.label}</Label>
        <Select
          value={typeof value === "string" ? value : undefined}
          onValueChange={(nextValue) => onChange(field.key, nextValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.control === "checkbox-group") {
    const selectedValues = Array.isArray(value) ? value : []
    const options = resolveFieldChoices(field, currentValues)

    return (
      <div key={field.key} className="space-y-2.5">
        <Label>{field.label}</Label>
        <div className={field.layout === "stacked" ? "space-y-2" : "grid gap-2 sm:grid-cols-2"}>
          {options.map((option) => {
            const checked = selectedValues.includes(option.value)

            return (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => {
                    const current = Array.isArray(value) ? value : []

                    if (nextChecked === true) {
                      onChange(field.key, [...current, option.value])
                    } else {
                      onChange(
                        field.key,
                        current.filter((item) => item !== option.value)
                      )
                    }
                  }}
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (field.control === "textarea") {
    return (
      <div key={field.key} className="space-y-2.5">
        <Label>{field.label}</Label>
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          rows={field.rows}
        />
      </div>
    )
  }

  if (field.control === "number") {
    return (
      <div key={field.key} className="space-y-2.5">
        <Label>{field.label}</Label>
        <Input
          type="number"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      </div>
    )
  }

  return (
    <div key={field.key} className="space-y-2.5">
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

function renderOptionFields(
  fields: ZalivatorOptionField[],
  currentValues: Record<string, ZalivatorOptionValue>,
  onChange: (key: string, value: ZalivatorOptionValue) => void
) {
  const content: ReactNode[] = []

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index]
    const nextField = fields[index + 1]

    if (
      field?.control === "number" &&
      nextField?.control === "number" &&
      field.key === "min" &&
      nextField.key === "max"
    ) {
      content.push(
        <div key="measurement-range" className="grid gap-3 sm:grid-cols-2">
          {renderOptionField(field, currentValues[field.key], currentValues, onChange)}
          {renderOptionField(nextField, currentValues[nextField.key], currentValues, onChange)}
        </div>
      )
      index += 1
      continue
    }

    content.push(renderOptionField(field, currentValues[field.key], currentValues, onChange))
  }

  return content
}

function buildPayloadOptions(
  fields: ZalivatorOptionField[],
  currentValues: Record<string, ZalivatorOptionValue>
) {
  const allowedKeys = new Set(fields.map((field) => field.key))

  return Object.fromEntries(
    Object.entries(currentValues).filter(([key, value]) => {
      if (!allowedKeys.has(key)) {
        return false
      }

      if (Array.isArray(value)) {
        return value.length > 0
      }

      return value.trim() !== ""
    })
  )
}

export function ZalivatorWorkspace() {
  const [generator, setGenerator] = useState<ZalivatorGeneratorId>("name")
  const [quantity, setQuantity] = useState(10)
  const [unique, setUnique] = useState(false)
  const [options, setOptions] = useState<Record<string, ZalivatorOptionValue>>(() =>
    buildDefaultOptions("name")
  )
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

  const handleOptionChange = (key: string, nextValue: ZalivatorOptionValue) => {
    setOptions((current) => {
      const nextOptions = {
        ...current,
        [key]: Array.isArray(nextValue) ? [...new Set(nextValue)] : nextValue,
      }
      const nextMetadata = getZalivatorGeneratorMetadata(generator)

      for (const field of nextMetadata.optionFields) {
        if (field.control === "checkbox-group" && field.dependsOn === key) {
          nextOptions[field.key] = resolveFieldChoices(field, nextOptions).map(
            (option) => option.value
          )
        }
      }

      return nextOptions
    })
  }

  const handleGenerate = async () => {
    setIsPending(true)
    setError(null)

    try {
      const payloadOptions = buildPayloadOptions(metadata.optionFields, options)

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
    <main className="flex h-full min-h-0 w-full flex-col gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5 lg:overflow-hidden xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardContent className="space-y-6 p-5 lg:p-6">
          <ZalivatorGeneratorPicker value={generator} onChange={handleGeneratorChange} />

          {generator === "uuidV7" ? (
            <p className="text-sm leading-5 text-muted-foreground">
              RFC 9562 UUID v7 с Unix timestamp в миллисекундах, корректным variant и time-ordered batch-поведением.
            </p>
          ) : null}

          {metadata.optionFields.length > 0 ? (
            <>
              <section className="space-y-4.5">
                {renderOptionFields(metadata.optionFields, options, handleOptionChange)}
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
