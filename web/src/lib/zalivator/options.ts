export const ZALIVATOR_NAME_FORMATS = [
  "full",
  "surname-initials",
  "name-surname",
  "name-only",
] as const

export type ZalivatorNameFormat = (typeof ZALIVATOR_NAME_FORMATS)[number]

export const ZALIVATOR_NAME_GENDERS = ["any", "male", "female"] as const

export type ZalivatorNameGender = (typeof ZALIVATOR_NAME_GENDERS)[number]

export const ZALIVATOR_MOBILE_PHONE_FORMATS = ["pretty", "plain"] as const

export type ZalivatorMobilePhoneFormat = (typeof ZALIVATOR_MOBILE_PHONE_FORMATS)[number]

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
      ? "full"
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
    return { format: "pretty" }
  }

  if (
    typeof format !== "string" ||
    !ZALIVATOR_MOBILE_PHONE_FORMATS.includes(format as ZalivatorMobilePhoneFormat)
  ) {
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
