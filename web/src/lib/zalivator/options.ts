import {
  ZALIVATOR_MEASUREMENT_CUSTOM_TYPE,
  ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER,
  listMeasurementSubtypes,
  type ZalivatorMeasurementStandardType,
  type ZalivatorMeasurementType,
} from "@/lib/zalivator/measurement-catalog"

export const ZALIVATOR_NAME_FORMATS = [
  "last-name-only",
  "first-name-only",
  "patronymic-only",
  "last-first-patronymic",
  "first-patronymic-last",
  "first-last",
  "last-first",
  "first-last-initial",
  "last-first-initial",
  "first-initial-last",
  "last-initials",
  "initials-last",
] as const

export type ZalivatorNameFormat = (typeof ZALIVATOR_NAME_FORMATS)[number]

export const ZALIVATOR_NAME_GENDERS = ["any", "male", "female"] as const

export type ZalivatorNameGender = (typeof ZALIVATOR_NAME_GENDERS)[number]

export const ZALIVATOR_MOBILE_PHONE_FORMATS = [
  "plain",
  "spaced-hyphen",
  "paren-hyphen",
  "spaced",
] as const

export type ZalivatorMobilePhoneFormat = (typeof ZALIVATOR_MOBILE_PHONE_FORMATS)[number]

export const ZALIVATOR_INN_KINDS = ["physical", "legal"] as const

export type ZalivatorInnKind = (typeof ZALIVATOR_INN_KINDS)[number]

export const ZALIVATOR_POSITION_DOMAINS = [
  "any",
  "it",
  "fintech",
  "construction",
  "retail",
  "logistics",
] as const

export type ZalivatorPositionDomain = (typeof ZALIVATOR_POSITION_DOMAINS)[number]

export type ZalivatorNameOptions = {
  format: ZalivatorNameFormat
  gender: ZalivatorNameGender
}

export type ZalivatorMobilePhoneOptions = {
  format: ZalivatorMobilePhoneFormat
}

export type ZalivatorEmailOptions = {
  domain?: string
}

export type ZalivatorInnOptions = {
  kind: ZalivatorInnKind
}

export type ZalivatorPositionOptions = {
  domain: ZalivatorPositionDomain
}

export type ZalivatorMeasurementOptions = {
  min: number
  max: number
  type: ZalivatorMeasurementType
  subtypes: string[]
  customSubtypes: string[]
}

function assertNoUnknownOptions(
  raw: Record<string, unknown>,
  allowedKeys: string[],
  generator: string
) {
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(`Неизвестная опция "${key}" для generator "${generator}".`)
    }
  }
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^@+/, "")
}

function normalizeIntegerOption(
  value: unknown,
  key: string,
  generator: string
) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10)
  }

  throw new Error(`Опция "${key}" для generator "${generator}" должна быть целым числом.`)
}

function dedupeSubtypes(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = value.trim()

    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

export function createNoOptionsNormalizer(generator: string) {
  return (raw: Record<string, unknown> = {}) => {
    assertNoUnknownOptions(raw, [], generator)
    return {}
  }
}

export function normalizeNameOptions(
  raw: Record<string, unknown> = {}
): ZalivatorNameOptions {
  assertNoUnknownOptions(raw, ["format", "gender"], "name")

  const format = raw.format
  const gender = raw.gender

  const normalizedFormat =
    format === undefined
      ? ZALIVATOR_NAME_FORMATS[0]
      : typeof format === "string" &&
          ZALIVATOR_NAME_FORMATS.includes(format as ZalivatorNameFormat)
        ? (format as ZalivatorNameFormat)
        : null

  if (normalizedFormat === null) {
    throw new Error('Опция "format" для generator "name" имеет недопустимое значение.')
  }

  const normalizedGender =
    gender === undefined
      ? "any"
      : typeof gender === "string" &&
          ZALIVATOR_NAME_GENDERS.includes(gender as ZalivatorNameGender)
        ? (gender as ZalivatorNameGender)
        : null

  if (normalizedGender === null) {
    throw new Error('Опция "gender" для generator "name" имеет недопустимое значение.')
  }

  return {
    format: normalizedFormat,
    gender: normalizedGender,
  }
}

export function normalizeMobilePhoneOptions(
  raw: Record<string, unknown> = {}
): ZalivatorMobilePhoneOptions {
  assertNoUnknownOptions(raw, ["format"], "mobilePhone")

  const format = raw.format

  if (format === undefined) {
    return { format: "paren-hyphen" }
  }

  if (typeof format !== "string") {
    throw new Error(
      'Опция "format" для generator "mobilePhone" имеет недопустимое значение.'
    )
  }

  if (format === "pretty") {
    return { format: "paren-hyphen" }
  }

  if (!ZALIVATOR_MOBILE_PHONE_FORMATS.includes(format as ZalivatorMobilePhoneFormat)) {
    throw new Error(
      'Опция "format" для generator "mobilePhone" имеет недопустимое значение.'
    )
  }

  return { format: format as ZalivatorMobilePhoneFormat }
}

export function normalizeEmailOptions(
  raw: Record<string, unknown> = {}
): ZalivatorEmailOptions {
  assertNoUnknownOptions(raw, ["domain"], "email")

  if (raw.domain === undefined) {
    return {}
  }

  if (typeof raw.domain !== "string") {
    throw new Error('Опция "domain" для generator "email" должна быть строкой.')
  }

  const domain = normalizeDomain(raw.domain)

  if (!domain) {
    return {}
  }

  return { domain }
}

export function normalizeInnOptions(
  raw: Record<string, unknown> = {}
): ZalivatorInnOptions {
  assertNoUnknownOptions(raw, ["kind"], "inn")

  const kind = raw.kind

  if (kind === undefined) {
    return { kind: "legal" }
  }

  if (typeof kind !== "string" || !ZALIVATOR_INN_KINDS.includes(kind as ZalivatorInnKind)) {
    throw new Error('Опция "kind" для generator "inn" имеет недопустимое значение.')
  }

  return { kind: kind as ZalivatorInnKind }
}

export function normalizePositionOptions(
  raw: Record<string, unknown> = {}
): ZalivatorPositionOptions {
  assertNoUnknownOptions(raw, ["domain"], "position")

  const domain = raw.domain

  if (domain === undefined) {
    return { domain: "any" }
  }

  if (
    typeof domain !== "string" ||
    !ZALIVATOR_POSITION_DOMAINS.includes(domain as ZalivatorPositionDomain)
  ) {
    throw new Error('Опция "domain" для generator "position" имеет недопустимое значение.')
  }

  return { domain: domain as ZalivatorPositionDomain }
}

export function normalizeMeasurementOptions(
  raw: Record<string, unknown> = {}
): ZalivatorMeasurementOptions {
  assertNoUnknownOptions(
    raw,
    ["min", "max", "type", "subtypes", "customSubtypesText"],
    "measurement"
  )

  const type = raw.type

  const normalizedType =
    type === undefined
      ? ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER[0]
      : typeof type === "string" &&
          (type === ZALIVATOR_MEASUREMENT_CUSTOM_TYPE ||
            ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER.includes(
              type as ZalivatorMeasurementStandardType
            ))
        ? (type as ZalivatorMeasurementType)
        : null

  if (normalizedType === null) {
    throw new Error('Опция "type" для generator "measurement" имеет недопустимое значение.')
  }

  const min = raw.min === undefined ? 1 : normalizeIntegerOption(raw.min, "min", "measurement")
  const max = raw.max === undefined ? 100 : normalizeIntegerOption(raw.max, "max", "measurement")

  if (min > max) {
    throw new Error('Опция "min" не может быть больше "max" для generator "measurement".')
  }

  const allowedSubtypes =
    normalizedType === ZALIVATOR_MEASUREMENT_CUSTOM_TYPE
      ? new Set<string>()
      : new Set(listMeasurementSubtypes(normalizedType))

  let selectedSubtypes: string[] = []

  if (normalizedType === ZALIVATOR_MEASUREMENT_CUSTOM_TYPE) {
    selectedSubtypes = []
  } else if (raw.subtypes === undefined) {
    selectedSubtypes = listMeasurementSubtypes(normalizedType)
  } else if (Array.isArray(raw.subtypes) && raw.subtypes.every((item) => typeof item === "string")) {
    selectedSubtypes = dedupeSubtypes(raw.subtypes)
  } else if (typeof raw.subtypes === "string") {
    selectedSubtypes = dedupeSubtypes([raw.subtypes])
  } else {
    throw new Error('Опция "subtypes" для generator "measurement" должна быть строкой или списком строк.')
  }

  const normalizedSubtypes = selectedSubtypes.filter((subtype) => allowedSubtypes.has(subtype))

  const customSubtypesText =
    typeof raw.customSubtypesText === "string" ? raw.customSubtypesText : ""

  const customSubtypes = dedupeSubtypes(customSubtypesText.split(/\r?\n/))

  return {
    min,
    max,
    type: normalizedType,
    subtypes: normalizedSubtypes,
    customSubtypes,
  }
}
