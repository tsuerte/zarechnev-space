import { NextResponse } from "next/server"

import { consumeRateLimit, getRateLimitKey } from "@/lib/server/rate-limit"
import { optimizeSvg } from "@/lib/svg/optimize"
import type { OptimizeSvgBatchItemResult } from "@/lib/svg/types"
import {
  getSvgUploadError,
  MAX_SVG_BATCH_FILES,
  MAX_SVG_BATCH_TOTAL_SIZE,
} from "@/lib/svg/upload"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10

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
    const files = formData.getAll("files")

    if (files.length === 0) {
      return NextResponse.json({ error: "SVG файлы не переданы." }, { status: 400 })
    }

    if (files.length > MAX_SVG_BATCH_FILES) {
      return NextResponse.json(
        { error: `Можно загрузить не больше ${MAX_SVG_BATCH_FILES} SVG за раз.` },
        { status: 400 }
      )
    }

    const svgFiles = files.filter((file): file is File => file instanceof File)
    if (svgFiles.length === 0) {
      return NextResponse.json(
        { error: "SVG файлы не переданы." },
        { status: 400 }
      )
    }

    const totalUploadBytes = svgFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalUploadBytes > MAX_SVG_BATCH_TOTAL_SIZE) {
      return NextResponse.json(
        { error: "Общий размер набора слишком большой. Лимит: 20 MB." },
        { status: 400 }
      )
    }

    const items: OptimizeSvgBatchItemResult[] = await Promise.all(
      svgFiles.map(async (file) => {
        const uploadError = getSvgUploadError(file)
        if (uploadError) {
          return {
            fileName: file.name,
            optimizedSvg: null,
            originalBytes: 0,
            optimizedBytes: 0,
            savedPercent: 0,
            error: uploadError,
          }
        }

        try {
          const svg = await file.text()
          const result = optimizeSvg(svg)

          return {
            fileName: file.name,
            optimizedSvg: result.optimizedSvg,
            originalBytes: result.originalBytes,
            optimizedBytes: result.optimizedBytes,
            savedPercent: result.savedPercent,
            error: null,
          }
        } catch (error) {
          return {
            fileName: file.name,
            optimizedSvg: null,
            originalBytes: 0,
            optimizedBytes: 0,
            savedPercent: 0,
            error:
              error instanceof Error
                ? error.message
                : "Не удалось оптимизировать SVG.",
          }
        }
      })
    )

    const successfulItems = items.filter((item) => item.error === null)
    const originalBytes = successfulItems.reduce(
      (sum, item) => sum + item.originalBytes,
      0
    )
    const optimizedBytes = successfulItems.reduce(
      (sum, item) => sum + item.optimizedBytes,
      0
    )
    const savedPercent =
      originalBytes === 0
        ? 0
        : Number((((originalBytes - optimizedBytes) / originalBytes) * 100).toFixed(1))

    return NextResponse.json({
      items,
      totalCount: items.length,
      successCount: successfulItems.length,
      failedCount: items.length - successfulItems.length,
      originalBytes,
      optimizedBytes,
      savedPercent,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось обработать SVG."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
