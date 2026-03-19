import { NextResponse } from "next/server"

import {
  listZalivatorGeneratorMetadata,
  ZALIVATOR_QUANTITY_MAX,
  ZALIVATOR_QUANTITY_MIN,
  ZALIVATOR_QUANTITY_PRESETS,
} from "@/lib/zalivator/metadata"
import type { ZalivatorGeneratorsDiscoveryResponse } from "@/lib/zalivator/types"

export async function GET() {
  const payload: ZalivatorGeneratorsDiscoveryResponse = {
    generateEndpoint: "/api/zalivator/generate",
    quantity: {
      min: ZALIVATOR_QUANTITY_MIN,
      max: ZALIVATOR_QUANTITY_MAX,
      presets: [...ZALIVATOR_QUANTITY_PRESETS],
    },
    generators: listZalivatorGeneratorMetadata(),
  }

  return NextResponse.json(payload)
}
