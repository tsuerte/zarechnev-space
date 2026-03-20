import { NextResponse } from "next/server"

import { executeZalivatorGenerateRequest } from "@/lib/zalivator/executor"
import { listZalivatorGeneratorMetadata } from "@/lib/zalivator/metadata"
import type { ZalivatorGenerateRequest, ZalivatorGeneratorId } from "@/lib/zalivator/types"

const GENERATORS = new Set<ZalivatorGeneratorId>(
  listZalivatorGeneratorMetadata().map((generator) => generator.id)
)

function isGeneratorId(value: unknown): value is ZalivatorGeneratorId {
  return typeof value === "string" && GENERATORS.has(value as ZalivatorGeneratorId)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса." }, { status: 400 })
  }

  if (!isPlainObject(payload)) {
    return NextResponse.json({ error: "Тело запроса должно быть объектом." }, { status: 400 })
  }

  if (!isGeneratorId(payload.generator)) {
    return NextResponse.json({ error: 'Поле "generator" имеет недопустимое значение.' }, { status: 400 })
  }

  if (!Number.isInteger(payload.quantity)) {
    return NextResponse.json({ error: 'Поле "quantity" должно быть целым числом.' }, { status: 400 })
  }

  if (payload.unique !== undefined && typeof payload.unique !== "boolean") {
    return NextResponse.json({ error: 'Поле "unique" должно быть булевым значением.' }, { status: 400 })
  }

  if (payload.options !== undefined && !isPlainObject(payload.options)) {
    return NextResponse.json({ error: 'Поле "options" должно быть объектом.' }, { status: 400 })
  }

  const quantity = payload.quantity as number
  const unique = payload.unique as boolean | undefined
  const options = payload.options as Record<string, unknown> | undefined

  const generateRequest: ZalivatorGenerateRequest = {
    generator: payload.generator,
    quantity,
    unique,
    options,
  }

  try {
    const response = executeZalivatorGenerateRequest(generateRequest)
    return NextResponse.json(response)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось сгенерировать значения."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
