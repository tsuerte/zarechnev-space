"use client"

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import {
  Card,
  CardContent,
  Checkbox,
  ChoiceList,
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
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
type ZalivatorAutoRunMode = "immediate" | "debounced"
const ZALIVATOR_AUTO_RUN_DEBOUNCE_MS = 400

function isAbortError(cause: unknown) {
  return cause instanceof Error && cause.name === "AbortError"
}

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
  onChange: (key: string, value: ZalivatorOptionValue, mode?: ZalivatorAutoRunMode) => void
) {
  if (!isFieldVisible(field, currentValues)) {
    return null
  }

  if (field.control === "segmented") {
    if (field.options.length > 4) {
      return (
        <Field key={field.key}>
          <FieldLabel>{field.label}</FieldLabel>
          <FieldContent>
            <ChoiceList
              value={typeof value === "string" ? value : undefined}
              onValueChange={(nextValue) => onChange(field.key, nextValue, "immediate")}
              options={field.options}
              showIndex={field.key === "format" && field.label === "Формат"}
            />
          </FieldContent>
        </Field>
      )
    }

    return (
      <Field key={field.key}>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldContent>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={1}
            value={typeof value === "string" ? value : undefined}
            onValueChange={(nextValue) => {
              if (nextValue) {
                onChange(field.key, nextValue, "immediate")
              }
            }}
            className="flex flex-wrap justify-start"
          >
            {field.options.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldContent>
      </Field>
    )
  }

  if (field.control === "select") {
    if (field.options.length > 4) {
      return (
        <Field key={field.key}>
          <FieldLabel>{field.label}</FieldLabel>
          <FieldContent>
            <ChoiceList
              value={typeof value === "string" ? value : undefined}
              onValueChange={(nextValue) => onChange(field.key, nextValue, "immediate")}
              options={field.options}
            />
          </FieldContent>
        </Field>
      )
    }

    return (
      <Field key={field.key}>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldContent>
          <Select
            value={typeof value === "string" ? value : undefined}
            onValueChange={(nextValue) => onChange(field.key, nextValue, "immediate")}
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
        </FieldContent>
      </Field>
    )
  }

  if (field.control === "checkbox-group") {
    const selectedValues = Array.isArray(value) ? value : []
    const options = resolveFieldChoices(field, currentValues)

    return (
      <Field key={field.key}>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldContent>
          <FieldGroup
            data-slot={field.layout === "stacked" ? "checkbox-group" : undefined}
            className={field.layout === "stacked" ? undefined : "grid gap-2 sm:grid-cols-2"}
          >
            {options.map((option) => {
              const checked = selectedValues.includes(option.value)

              return (
                <Field key={option.value} orientation="horizontal">
                  <Switch
                    size="sm"
                    id={`${field.key}-${option.value}`}
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      const current = Array.isArray(value) ? value : []

                      if (nextChecked === true) {
                        onChange(field.key, [...current, option.value], "immediate")
                      } else {
                        onChange(
                          field.key,
                          current.filter((item) => item !== option.value),
                          "immediate"
                        )
                      }
                    }}
                  />
                  <FieldLabel htmlFor={`${field.key}-${option.value}`}>
                    {option.label}
                  </FieldLabel>
                </Field>
              )
            })}
          </FieldGroup>
        </FieldContent>
      </Field>
    )
  }

  if (field.control === "textarea") {
    return (
      <Field key={field.key}>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldContent>
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(field.key, event.target.value, "debounced")}
            placeholder={field.placeholder}
            rows={field.rows}
          />
        </FieldContent>
      </Field>
    )
  }

  if (field.control === "number") {
    return (
      <Field key={field.key}>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldContent>
          <Input
            type="number"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(field.key, event.target.value, "debounced")}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        </FieldContent>
      </Field>
    )
  }

  return (
    <Field key={field.key}>
      <FieldLabel>{field.label}</FieldLabel>
      <FieldContent>
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value, "debounced")}
          placeholder={field.placeholder}
          inputMode={field.inputMode}
        />
      </FieldContent>
    </Field>
  )
}

function renderOptionFields(
  fields: ZalivatorOptionField[],
  currentValues: Record<string, ZalivatorOptionValue>,
  onChange: (key: string, value: ZalivatorOptionValue, mode?: ZalivatorAutoRunMode) => void
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
  const autoRunModeRef = useRef<ZalivatorAutoRunMode>("immediate")
  const hasAutoGeneratedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoRunTimeoutRef = useRef<number | null>(null)

  const metadata = getZalivatorGeneratorMetadata(generator)

  const handleGeneratorChange = (nextGenerator: ZalivatorGeneratorId) => {
    autoRunModeRef.current = "immediate"
    setGenerator(nextGenerator)
    setOptions(buildDefaultOptions(nextGenerator))
    setUnique(false)
    setResult(null)
    setError(null)
  }

  const handleOptionChange = (
    key: string,
    nextValue: ZalivatorOptionValue,
    mode: ZalivatorAutoRunMode = "immediate"
  ) => {
    autoRunModeRef.current = mode
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

  const handleQuantityChange = (
    nextQuantity: number,
    mode: ZalivatorAutoRunMode = "immediate"
  ) => {
    autoRunModeRef.current = mode
    setQuantity(nextQuantity)
  }

  const runGenerate = useCallback(async () => {
    const currentMetadata = getZalivatorGeneratorMetadata(generator)
    const payloadOptions = buildPayloadOptions(currentMetadata.optionFields, options)
    const abortController = new AbortController()

    abortControllerRef.current?.abort()
    abortControllerRef.current = abortController
    setIsPending(true)
    setError(null)

    try {
      const response = await fetch("/api/zalivator/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
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

      if (abortControllerRef.current !== abortController) {
        return
      }

      setResult(payload)
    } catch (cause) {
      if (isAbortError(cause)) {
        return
      }

      if (abortControllerRef.current !== abortController) {
        return
      }

      setResult(null)
      setError(cause instanceof Error ? cause.message : "Не удалось сгенерировать значения.")
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
        setIsPending(false)
      }
    }
  }, [generator, options, quantity, unique])

  useEffect(() => {
    return () => {
      if (autoRunTimeoutRef.current !== null) {
        window.clearTimeout(autoRunTimeoutRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!hasAutoGeneratedRef.current) {
      hasAutoGeneratedRef.current = true
      void runGenerate()
      return
    }

    if (autoRunModeRef.current === "debounced") {
      autoRunTimeoutRef.current = window.setTimeout(() => {
        void runGenerate()
        autoRunTimeoutRef.current = null
      }, ZALIVATOR_AUTO_RUN_DEBOUNCE_MS)

      return () => {
        if (autoRunTimeoutRef.current !== null) {
          window.clearTimeout(autoRunTimeoutRef.current)
          autoRunTimeoutRef.current = null
        }
      }
    }

    void runGenerate()
  }, [generator, options, quantity, unique, runGenerate])

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-0 lg:grid lg:grid-cols-[220px_360px_minmax(0,1fr)] lg:overflow-hidden">
      <aside className="min-h-0 border-b lg:h-full lg:border-r lg:border-b-0">
        <div className="min-h-0 lg:h-full lg:overflow-auto">
          <ZalivatorGeneratorPicker value={generator} onChange={handleGeneratorChange} />
        </div>
      </aside>

      <Card className="min-h-0 overflow-hidden rounded-none border-0 border-b ring-0 shadow-none lg:h-full lg:border-r lg:border-b-0">
        <CardContent className="min-h-0 flex-1 overflow-auto space-y-4 px-4 pb-4 pt-3">
          {generator === "uuidV7" ? (
            <p className="text-sm leading-5 text-muted-foreground">
              RFC 9562 UUID v7 с Unix timestamp в миллисекундах, корректным variant и time-ordered batch-поведением.
            </p>
          ) : null}

          {metadata.optionFields.length > 0
            ? renderOptionFields(metadata.optionFields, options, handleOptionChange)
            : null}

          <ZalivatorQuantityControl value={quantity} onChange={handleQuantityChange} />

          {metadata.supportsUnique ? (
            <Field orientation="horizontal">
              <Checkbox
                id="zalivator-unique"
                checked={unique}
                onCheckedChange={(checked) => {
                  autoRunModeRef.current = "immediate"
                  setUnique(checked === true)
                }}
              />
              <FieldLabel htmlFor="zalivator-unique">Только уникальные</FieldLabel>
            </Field>
          ) : null}
        </CardContent>
      </Card>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:h-full">
        <ZalivatorResultList result={result} isPending={isPending} error={error} />
      </section>
    </main>
  )
}
