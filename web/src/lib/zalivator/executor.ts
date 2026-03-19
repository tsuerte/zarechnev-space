import {
  ZALIVATOR_QUANTITY_MAX,
  ZALIVATOR_QUANTITY_MIN,
} from "@/lib/zalivator/metadata"
import { getZalivatorGenerator } from "@/lib/zalivator/registry"
import type {
  ZalivatorGenerateRequest,
  ZalivatorGenerateResponse,
} from "@/lib/zalivator/types"

export function executeZalivatorGenerateRequest(
  request: ZalivatorGenerateRequest
): ZalivatorGenerateResponse {
  if (!Number.isInteger(request.quantity)) {
    throw new Error('Поле "quantity" должно быть целым числом.')
  }

  if (request.quantity < ZALIVATOR_QUANTITY_MIN || request.quantity > ZALIVATOR_QUANTITY_MAX) {
    throw new Error(
      `Поле "quantity" должно быть в диапазоне ${ZALIVATOR_QUANTITY_MIN}-${ZALIVATOR_QUANTITY_MAX}.`
    )
  }

  const generator = getZalivatorGenerator(request.generator)
  const options = generator.normalizeOptions(request.options)
  const unique = request.unique === true

  if (!unique) {
    return {
      kind: "text",
      generator: request.generator,
      quantity: request.quantity,
      unique: false,
      values: Array.from({ length: request.quantity }, () => generator.generateValue(options)),
    }
  }

  const values: string[] = []
  const seen = new Set<string>()
  const maxAttempts = Math.max(request.quantity * 20, 100)
  let attempts = 0

  while (values.length < request.quantity && attempts < maxAttempts) {
    const nextValue = generator.generateValue(options)
    attempts += 1

    if (seen.has(nextValue)) {
      continue
    }

    seen.add(nextValue)
    values.push(nextValue)
  }

  if (values.length < request.quantity) {
    throw new Error(
      `Не удалось собрать ${request.quantity} уникальных значений для generator "${request.generator}".`
    )
  }

  return {
    kind: "text",
    generator: request.generator,
    quantity: request.quantity,
    unique: true,
    values,
  }
}
