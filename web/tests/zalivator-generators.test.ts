import test from "node:test"
import assert from "node:assert/strict"

import { generateCity } from "../src/lib/zalivator/generators/text/city"
import { generateEmail } from "../src/lib/zalivator/generators/text/email"
import {
  calculateInnCheckDigits,
  generateInn,
} from "../src/lib/zalivator/generators/text/inn"
import { generateKpp } from "../src/lib/zalivator/generators/text/kpp"
import { generateMobilePhone } from "../src/lib/zalivator/generators/text/mobile-phone"
import { generateName } from "../src/lib/zalivator/generators/text/name"
import { generateOrganizationName } from "../src/lib/zalivator/generators/text/organization-name"
import {
  POSITION_BY_DOMAIN,
  generatePosition,
} from "../src/lib/zalivator/generators/text/position"
import {
  calculateSnilsCheckNumber,
  generateSnils,
} from "../src/lib/zalivator/generators/text/snils"
import { generateUuidV7 } from "../src/lib/zalivator/generators/text/uuid-v7"

function decodeUuidV7Timestamp(value: string) {
  return Number.parseInt(value.replace(/-/g, "").slice(0, 12), 16)
}

function decodeUuidV7Counter(value: string) {
  return Number.parseInt(value.replace(/-/g, "").slice(12, 16), 16) & 0x0fff
}

test("name generator supports configured text formats", () => {
  const full = generateName({ format: "full", gender: "male" })
  const initials = generateName({ format: "surname-initials", gender: "female" })
  const nameOnly = generateName({ format: "name-only", gender: "female" })

  assert.match(full, /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/)
  assert.match(initials, /^[А-ЯЁ][а-яё]+ [А-Я]\. [А-Я]\.$/)
  assert.match(nameOnly, /^[А-ЯЁ][а-яё]+$/)
})

test("name generator respects gender option", () => {
  const female = generateName({ format: "full", gender: "female" })
  const male = generateName({ format: "full", gender: "male" })

  assert.match(female, /(Иванова|Петрова|Соколова|Козлова|Смирнова|Новикова|Романова|Васильева)/)
  assert.match(male, /(Иванов|Петров|Соколов|Козлов|Смирнов|Новиков|Романов|Васильев)/)
})

test("mobile phone generator supports multiple output formats", () => {
  const pretty = generateMobilePhone({ format: "pretty" })
  const plain = generateMobilePhone({ format: "plain" })

  assert.match(pretty, /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/)
  assert.match(plain, /^\+7\d{10}$/)
})

test("email generator respects custom domains with varied local-parts", () => {
  const value = generateEmail({ domain: "yandex.ru" })

  assert.match(value, /^[a-z0-9._]+@yandex\.ru$/)
})

test("snils generator returns a formatted value with a valid checksum", () => {
  const value = generateSnils()

  assert.match(value, /^\d{3}-\d{3}-\d{3} \d{2}$/)

  const digits = value.replace(/\D/g, "")
  const baseDigits = digits.slice(0, 9)
  const checkNumber = digits.slice(9)

  assert.equal(checkNumber, calculateSnilsCheckNumber(baseDigits))
})

test("city generator returns a Russian city name from the built-in list", () => {
  const value = generateCity()

  assert.match(value, /^[А-ЯЁ][А-Яа-яё\- ]+$/)
})

test("organization name generator returns a legal form, entrepreneur, or plain organization name", () => {
  const values = Array.from({ length: 50 }, () => generateOrganizationName())

  assert.ok(
    values.every((value) => {
      return (
        /^(ООО|АО|ПАО) «.+»$/.test(value) ||
        /^ИП [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/.test(value) ||
        /^[А-ЯЁ][А-Яа-яё]+$/.test(value)
      )
    })
  )

  assert.ok(values.some((value) => /^(ООО|АО|ПАО) «.+»$/.test(value)))
  assert.ok(values.some((value) => /^ИП [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/.test(value)))
  assert.ok(values.some((value) => /^[А-ЯЁ][А-Яа-яё]+$/.test(value)))
})

test("inn generator returns correct legal and physical values", () => {
  const legal = generateInn({ kind: "legal" })
  const physical = generateInn({ kind: "physical" })

  assert.match(legal, /^\d{10}$/)
  assert.match(physical, /^\d{12}$/)
  assert.equal(legal.slice(-1), calculateInnCheckDigits("legal", legal.slice(0, 9)))
  assert.equal(
    physical.slice(-2),
    calculateInnCheckDigits("physical", physical.slice(0, 10))
  )
})

test("kpp generator returns a 9-digit format-valid value", () => {
  const value = generateKpp()

  assert.match(value, /^\d{9}$/)
})

test("position generator respects selected domain and supports any", () => {
  const allPositions = Object.values(POSITION_BY_DOMAIN).flat()
  const logisticsOffset =
    POSITION_BY_DOMAIN.it.length +
    POSITION_BY_DOMAIN.fintech.length +
    POSITION_BY_DOMAIN.construction.length +
    POSITION_BY_DOMAIN.retail.length

  const originalRandom = Math.random
  const sequence = [
    0,
    (POSITION_BY_DOMAIN.it.length - 1) / POSITION_BY_DOMAIN.it.length,
    0,
    (POSITION_BY_DOMAIN.logistics.length - 1) / POSITION_BY_DOMAIN.logistics.length,
    0,
    logisticsOffset / allPositions.length,
  ]

  Math.random = () => sequence.shift() ?? 0

  try {
    const firstIt = generatePosition({ domain: "it" })
    const lastIt = generatePosition({ domain: "it" })
    const firstLogistics = generatePosition({ domain: "logistics" })
    const lastLogistics = generatePosition({ domain: "logistics" })
    const anyIt = generatePosition({ domain: "any" })
    const anyLogistics = generatePosition({ domain: "any" })

    assert.notEqual(firstIt, lastIt)
    assert.notEqual(firstLogistics, lastLogistics)
    assert.ok(!POSITION_BY_DOMAIN.logistics.includes(firstIt))
    assert.ok(!POSITION_BY_DOMAIN.it.includes(firstLogistics))
    assert.ok(POSITION_BY_DOMAIN.it.includes(anyIt))
    assert.ok(POSITION_BY_DOMAIN.logistics.includes(anyLogistics))
  } finally {
    Math.random = originalRandom
  }
})

test("position generator keeps at least 30 roles in every domain", () => {
  for (const [domain, positions] of Object.entries(POSITION_BY_DOMAIN)) {
    assert.ok(
      positions.length >= 30,
      `domain "${domain}" should contain at least 30 positions`
    )
  }
})

test("uuid v7 generator returns a RFC 9562-compatible value", () => {
  const value = generateUuidV7()

  assert.match(
    value,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  )

  const timestamp = decodeUuidV7Timestamp(value)
  const versionNibble = value.replace(/-/g, "").slice(12, 13)
  const variantNibble = value.replace(/-/g, "").slice(16, 17)

  assert.ok(Math.abs(Date.now() - timestamp) < 60_000)
  assert.equal(versionNibble, "7")
  assert.ok(["8", "9", "a", "b"].includes(variantNibble))
})

test("uuid v7 generator stays lexicographically ordered in a batch", () => {
  const values = Array.from({ length: 64 }, () => generateUuidV7())
  const sortedValues = [...values].sort()

  assert.deepEqual(values, sortedValues)
  assert.equal(new Set(values).size, values.length)
})

test("uuid v7 generator uses a monotonic counter within one millisecond", () => {
  const values = Array.from({ length: 64 }, () => generateUuidV7())
  const groups = new Map<number, string[]>()

  for (const value of values) {
    const timestamp = decodeUuidV7Timestamp(value)
    const group = groups.get(timestamp) ?? []
    group.push(value)
    groups.set(timestamp, group)
  }

  for (const group of groups.values()) {
    const counters = group.map(decodeUuidV7Counter)
    const sortedCounters = [...counters].sort((left, right) => left - right)

    assert.deepEqual(counters, sortedCounters)
  }
})
