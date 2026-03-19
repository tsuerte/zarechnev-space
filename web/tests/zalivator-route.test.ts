import test from "node:test"
import assert from "node:assert/strict"

import { GET } from "../src/app/api/zalivator/generators/route"
import { POST } from "../src/app/api/zalivator/generate/route"

function createGenerateRequest(body: unknown) {
  return new Request("http://localhost/api/zalivator/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

test("POST /api/zalivator/generate returns text values for a valid request", async () => {
  const response = await POST(
    createGenerateRequest({
      generator: "email",
      quantity: 2,
      options: {
        domain: "mail.ru",
      },
    })
  )

  assert.equal(response.status, 200)

  const payload = (await response.json()) as {
    kind: string
    generator: string
    quantity: number
    values: string[]
  }

  assert.equal(payload.kind, "text")
  assert.equal(payload.generator, "email")
  assert.equal(payload.quantity, 2)
  assert.equal(payload.values.length, 2)
  assert.ok(payload.values.every((value) => value.endsWith("@mail.ru")))
})

test("POST /api/zalivator/generate rejects non-object options", async () => {
  const response = await POST(
    createGenerateRequest({
      generator: "name",
      quantity: 1,
      options: "full",
    })
  )

  assert.equal(response.status, 400)

  const payload = (await response.json()) as { error: string }

  assert.match(payload.error, /options/)
})

test("GET /api/zalivator/generators returns discovery metadata", async () => {
  const response = await GET()

  assert.equal(response.status, 200)

  const payload = (await response.json()) as {
    generateEndpoint: string
    quantity: { min: number; max: number; presets: number[] }
    generators: Array<{ id: string; label: string }>
  }

  assert.equal(payload.generateEndpoint, "/api/zalivator/generate")
  assert.deepEqual(payload.quantity.presets, [1, 5, 10])
  assert.deepEqual(
    payload.generators.map((generator) => generator.id),
    ["name", "mobilePhone", "email"]
  )
})
