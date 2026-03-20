import test from "node:test"
import assert from "node:assert/strict"

import { generateCity } from "../src/lib/zalivator/generators/text/city"
import { generateEmail } from "../src/lib/zalivator/generators/text/email"
import { generateMobilePhone } from "../src/lib/zalivator/generators/text/mobile-phone"
import { generateName } from "../src/lib/zalivator/generators/text/name"
import {
  calculateSnilsCheckNumber,
  generateSnils,
} from "../src/lib/zalivator/generators/text/snils"

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
