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

  return {
    kind: "text",
    generator: request.generator,
    quantity: request.quantity,
    values: Array.from({ length: request.quantity }, () => generator.generateValue(options)),
  }
}
