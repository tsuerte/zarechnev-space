"use client"

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import {
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
import {
  getZalivatorGeneratorMetadata,
  listZalivatorGeneratorMetadata,
  ZALIVATOR_QUANTITY_MAX,
  ZALIVATOR_QUANTITY_MIN,
} from "@/lib/zalivator/metadata"
import type {
  ZalivatorGenerateResponse,
  ZalivatorGeneratorId,
  ZalivatorOptionChoice,
  ZalivatorOptionField,
} from "@/lib/zalivator/types"
import { ZalivatorGeneratorPicker } from "@/components/zalivator/zalivator-generator-picker"
import { ZalivatorResultList } from "@/components/zalivator/zalivator-result-list"

type ZalivatorOptionValue = string | string[]
type ZalivatorAutoRunMode = "immediate" | "debounced"
const ZALIVATOR_AUTO_RUN_DEBOUNCE_MS = 400
const ZALIVATOR_PERSISTED_STATE_KEY = "zalivator:workspace:v2"
const ZALIVATOR_LEGACY_PERSISTED_STATE_KEY = "zalivator:workspace:v1"
const ZALIVATOR_PERSIST_DEBOUNCE_MS = 200
const ZALIVATOR_DEFAULT_QUANTITY = 10

type ZalivatorGeneratorDraft = {
  options: Record<string, unknown>
  quantity: number
  unique: boolean
}

type ZalivatorPersistedState = {
  generator: ZalivatorGeneratorId
  drafts: Partial<Record<ZalivatorGeneratorId, ZalivatorGeneratorDraft>>
  savedAt: number
}

type ZalivatorLegacyPersistedState = {
  generator: ZalivatorGeneratorId
  quantity: number
  unique: boolean
  options: Record<string, unknown>
  savedAt: number
}

function isAbortError(cause: unknown) {
  return cause instanceof Error && cause.name === "AbortError"
}

function isPersistedState(
  value: unknown
): value is ZalivatorPersistedState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const candidate = value as Partial<ZalivatorPersistedState>

  return (
    typeof candidate.generator === "string" &&
    listZalivatorGeneratorMetadata().some((generator) => generator.id === candidate.generator) &&
    candidate.drafts !== null &&
    typeof candidate.drafts === "object" &&
    !Array.isArray(candidate.drafts) &&
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt)
  )
}

function isLegacyPersistedState(
  value: unknown
): value is ZalivatorLegacyPersistedState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const candidate = value as Partial<ZalivatorLegacyPersistedState>

  return (
    typeof candidate.generator === "string" &&
    listZalivatorGeneratorMetadata().some((generator) => generator.id === candidate.generator) &&
    typeof candidate.quantity === "number" &&
    Number.isFinite(candidate.quantity) &&
    typeof candidate.unique === "boolean" &&
    candidate.options !== null &&
    typeof candidate.options === "object" &&
    !Array.isArray(candidate.options) &&
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt)
  )
}

function normalizePersistedQuantity(quantity: number) {
  return Math.min(
    ZALIVATOR_QUANTITY_MAX,
    Math.max(ZALIVATOR_QUANTITY_MIN, Math.round(quantity))
  )
}

function buildDefaultDraft(generator: ZalivatorGeneratorId): ZalivatorGeneratorDraft {
  return {
    options: buildDefaultOptions(generator),
    quantity: ZALIVATOR_DEFAULT_QUANTITY,
    unique: false,
  }
}

function restoreOptions(
  generator: ZalivatorGeneratorId,
  persistedOptions: Record<string, unknown>
) {
  const metadata = getZalivatorGeneratorMetadata(generator)
  const restoredOptions = buildDefaultOptions(generator)

  for (const field of metadata.optionFields) {
    const nextValue = persistedOptions[field.key]

    if (field.control === "segmented" || field.control === "select") {
      if (
        typeof nextValue === "string" &&
        field.options.some((option) => option.value === nextValue)
      ) {
        restoredOptions[field.key] = nextValue
      }
      continue
    }

    if (field.control === "text" || field.control === "textarea" || field.control === "number") {
      if (typeof nextValue === "string") {
        restoredOptions[field.key] = nextValue
      }
      continue
    }

    if (field.control === "checkbox-group" && Array.isArray(nextValue)) {
      const allowedValues = new Set(resolveFieldChoices(field, restoredOptions).map((option) => option.value))
      restoredOptions[field.key] = nextValue.filter(
        (item): item is string => typeof item === "string" && allowedValues.has(item)
      )
    }
  }

  return restoredOptions
}

function restoreDraft(
  generator: ZalivatorGeneratorId,
  persistedDraft: unknown
): ZalivatorGeneratorDraft {
  const metadata = getZalivatorGeneratorMetadata(generator)
  const defaultDraft = buildDefaultDraft(generator)

  if (!persistedDraft || typeof persistedDraft !== "object" || Array.isArray(persistedDraft)) {
    return defaultDraft
  }

  const candidate = persistedDraft as Partial<ZalivatorGeneratorDraft>
  const options =
    candidate.options && typeof candidate.options === "object" && !Array.isArray(candidate.options)
      ? candidate.options
      : {}

  return {
    options: restoreOptions(generator, options),
    quantity:
      typeof candidate.quantity === "number" && Number.isFinite(candidate.quantity)
        ? normalizePersistedQuantity(candidate.quantity)
        : defaultDraft.quantity,
    unique: metadata.supportsUnique ? candidate.unique === true : false,
  }
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
  const [draftsByGenerator, setDraftsByGenerator] = useState<
    Partial<Record<ZalivatorGeneratorId, ZalivatorGeneratorDraft>>
  >(() => ({
    name: buildDefaultDraft("name"),
  }))
  const [result, setResult] = useState<ZalivatorGenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const autoRunModeRef = useRef<ZalivatorAutoRunMode>("immediate")
  const hasAutoGeneratedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoRunTimeoutRef = useRef<number | null>(null)
  const persistTimeoutRef = useRef<number | null>(null)

  const metadata = getZalivatorGeneratorMetadata(generator)
  const activeDraft = draftsByGenerator[generator] ?? buildDefaultDraft(generator)
  const options = activeDraft.options as Record<string, ZalivatorOptionValue>
  const quantity = activeDraft.quantity
  const unique = activeDraft.unique

  const handleGeneratorChange = (nextGenerator: ZalivatorGeneratorId) => {
    autoRunModeRef.current = "immediate"
    setGenerator(nextGenerator)
    setDraftsByGenerator((current) => {
      if (current[nextGenerator]) {
        return current
      }

      return {
        ...current,
        [nextGenerator]: buildDefaultDraft(nextGenerator),
      }
    })
    setResult(null)
    setError(null)
  }

  const handleOptionChange = (
    key: string,
    nextValue: ZalivatorOptionValue,
    mode: ZalivatorAutoRunMode = "immediate"
  ) => {
    autoRunModeRef.current = mode
    setDraftsByGenerator((current) => {
      const currentDraft = current[generator] ?? buildDefaultDraft(generator)
      const currentOptions = currentDraft.options as Record<string, ZalivatorOptionValue>
      const nextOptions = {
        ...currentOptions,
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

      return {
        ...current,
        [generator]: {
          ...currentDraft,
          options: nextOptions,
        },
      }
    })
  }

  const handleQuantityChange = (
    nextQuantity: number,
    mode: ZalivatorAutoRunMode = "immediate"
  ) => {
    autoRunModeRef.current = mode
    setDraftsByGenerator((current) => {
      const currentDraft = current[generator] ?? buildDefaultDraft(generator)

      return {
        ...current,
        [generator]: {
          ...currentDraft,
          quantity: nextQuantity,
        },
      }
    })
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
      if (persistTimeoutRef.current !== null) {
        window.clearTimeout(persistTimeoutRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    try {
      const persistedState =
        window.localStorage.getItem(ZALIVATOR_PERSISTED_STATE_KEY) ??
        window.localStorage.getItem(ZALIVATOR_LEGACY_PERSISTED_STATE_KEY)

      if (!persistedState) {
        return
      }

      const parsed = JSON.parse(persistedState) as unknown

      if (isPersistedState(parsed)) {
        const restoredGenerator = parsed.generator
        const restoredDrafts: Partial<Record<ZalivatorGeneratorId, ZalivatorGeneratorDraft>> = {}

        for (const generatorMetadata of listZalivatorGeneratorMetadata()) {
          const draft = parsed.drafts[generatorMetadata.id]

          if (draft) {
            restoredDrafts[generatorMetadata.id] = restoreDraft(generatorMetadata.id, draft)
          }
        }

        if (!restoredDrafts[restoredGenerator]) {
          restoredDrafts[restoredGenerator] = buildDefaultDraft(restoredGenerator)
        }

        autoRunModeRef.current = "immediate"
        setGenerator(restoredGenerator)
        setDraftsByGenerator(restoredDrafts)
        setResult(null)
        setError(null)
        return
      }

      if (isLegacyPersistedState(parsed)) {
        const restoredGenerator = parsed.generator
        const restoredDrafts: Partial<Record<ZalivatorGeneratorId, ZalivatorGeneratorDraft>> = {
          [restoredGenerator]: restoreDraft(restoredGenerator, parsed),
        }

        autoRunModeRef.current = "immediate"
        setGenerator(restoredGenerator)
        setDraftsByGenerator(restoredDrafts)
        setResult(null)
        setError(null)
        return
      }

      window.localStorage.removeItem(ZALIVATOR_PERSISTED_STATE_KEY)
      window.localStorage.removeItem(ZALIVATOR_LEGACY_PERSISTED_STATE_KEY)
    } catch {
      window.localStorage.removeItem(ZALIVATOR_PERSISTED_STATE_KEY)
      window.localStorage.removeItem(ZALIVATOR_LEGACY_PERSISTED_STATE_KEY)
    } finally {
      setHasRestoredState(true)
    }
  }, [])

  useEffect(() => {
    if (!hasRestoredState) {
      return
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      const persistedState: ZalivatorPersistedState = {
        generator,
        drafts: draftsByGenerator,
        savedAt: Date.now(),
      }

      window.localStorage.setItem(
        ZALIVATOR_PERSISTED_STATE_KEY,
        JSON.stringify(persistedState)
      )
      window.localStorage.removeItem(ZALIVATOR_LEGACY_PERSISTED_STATE_KEY)
      persistTimeoutRef.current = null
    }, ZALIVATOR_PERSIST_DEBOUNCE_MS)

    return () => {
      if (persistTimeoutRef.current !== null) {
        window.clearTimeout(persistTimeoutRef.current)
        persistTimeoutRef.current = null
      }
    }
  }, [draftsByGenerator, generator, hasRestoredState])

  useEffect(() => {
    if (!hasRestoredState) {
      return
    }

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
  }, [generator, hasRestoredState, options, quantity, unique, runGenerate])

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-0 lg:grid lg:grid-cols-[220px_360px_minmax(0,1fr)] lg:overflow-hidden">
      <aside className="min-h-0 border-b lg:h-full lg:border-r lg:border-b-0">
        <div className="min-h-0 lg:h-full lg:overflow-auto">
          <ZalivatorGeneratorPicker value={generator} onChange={handleGeneratorChange} />
        </div>
      </aside>

      <section className="min-h-0 border-b lg:h-full lg:border-r lg:border-b-0">
        <div className="flex h-full min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {generator === "uuidV7" ? (
                <p className="text-sm leading-5 text-muted-foreground">
                  RFC 9562 UUID v7 с Unix timestamp в миллисекундах, корректным variant и time-ordered batch-поведением.
                </p>
              ) : null}

              {metadata.optionFields.length > 0 ? (
                <FieldGroup className="gap-4">
                  {renderOptionFields(metadata.optionFields, options, handleOptionChange)}
                </FieldGroup>
              ) : generator !== "uuidV7" ? (
                <p className="text-sm leading-5 text-muted-foreground">
                  Дополнительных настроек нет. Набор обновляется сразу по базовому сценарию.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:h-full">
        <ZalivatorResultList
          result={result}
          isPending={isPending}
          error={error}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          unique={unique}
          supportsUnique={metadata.supportsUnique}
          onUniqueChange={(nextValue) => {
            autoRunModeRef.current = "immediate"
            setDraftsByGenerator((current) => {
              const currentDraft = current[generator] ?? buildDefaultDraft(generator)

              return {
                ...current,
                [generator]: {
                  ...currentDraft,
                  unique: nextValue,
                },
              }
            })
          }}
        />
      </section>
    </main>
  )
}
