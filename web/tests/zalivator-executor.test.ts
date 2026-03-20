import test from "node:test"
import assert from "node:assert/strict"

import { executeZalivatorGenerateRequest } from "../src/lib/zalivator/executor"

test("executor returns the requested number of text values", () => {
  const payload = executeZalivatorGenerateRequest({
    generator: "mobilePhone",
    quantity: 5,
  })

  assert.equal(payload.kind, "text")
  assert.equal(payload.generator, "mobilePhone")
  assert.equal(payload.quantity, 5)
  assert.equal(payload.unique, false)
  assert.equal(payload.values.length, 5)
  assert.ok(payload.values.every((value) => typeof value === "string" && value.length > 0))
})

test("executor can enforce uniqueness within one batch", () => {
  const payload = executeZalivatorGenerateRequest({
    generator: "mobilePhone",
    quantity: 20,
    unique: true,
  })

  assert.equal(payload.unique, true)
  assert.equal(new Set(payload.values).size, payload.values.length)
})

test("executor validates quantity bounds", () => {
  assert.throws(
    () =>
      executeZalivatorGenerateRequest({
        generator: "name",
        quantity: 0,
      }),
    /quantity/
  )
})

test("executor preserves option validation errors", () => {
  assert.throws(
    () =>
      executeZalivatorGenerateRequest({
        generator: "name",
        quantity: 1,
        options: {
          format: "invalid",
        },
      }),
    /format/
  )
})

test("executor fails when unique batch cannot be assembled", () => {
  assert.throws(
    () =>
      executeZalivatorGenerateRequest({
        generator: "name",
        quantity: 9,
        unique: true,
        options: {
          format: "first-name-only",
          gender: "female",
        },
      }),
    /уникальн/i
  )
})
