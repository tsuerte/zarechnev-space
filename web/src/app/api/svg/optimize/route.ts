import { NextResponse } from "next/server"

import { consumeRateLimit, getRateLimitKey } from "@/lib/server/rate-limit"
import { optimizeSvg } from "@/lib/svg/optimize"
import { getSvgUploadError } from "@/lib/svg/upload"
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 20

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(
      getRateLimitKey(request),
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS
    )

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте чуть позже." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "SVG файл не передан." }, { status: 400 })
    }

    const uploadError = getSvgUploadError(file)
    if (uploadError) {
      return NextResponse.json({ error: uploadError }, { status: 400 })
    }

    const svg = await file.text()
    const result = optimizeSvg(svg)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось оптимизировать SVG."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
