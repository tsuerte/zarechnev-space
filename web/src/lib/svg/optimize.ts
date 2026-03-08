import { runCanonicalSvgPipeline } from "@/lib/svg/pipeline"
import type { OptimizeSvgResult } from "@/lib/svg/types"

function getByteSize(value: string) {
  return Buffer.byteLength(value, "utf8")
}

function normalizeSvgInput(svg: string) {
  return svg.replace(/^\uFEFF/, "").trim()
}

function isSvgDocument(svg: string) {
  return /^(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*(?:<!doctype[\s\S]*?>\s*)*<svg[\s>]/i.test(svg)
}

export function optimizeSvg(svg: string): OptimizeSvgResult {
  const originalSvg = normalizeSvgInput(svg)

  if (!isSvgDocument(originalSvg)) {
    throw new Error("Файл не выглядит как валидный SVG-документ.")
  }

  const optimizedSvg = runCanonicalSvgPipeline(originalSvg)
  const originalBytes = getByteSize(originalSvg)
  const optimizedBytes = getByteSize(optimizedSvg)
  const savedPercent =
    originalBytes === 0
      ? 0
      : Number((((originalBytes - optimizedBytes) / originalBytes) * 100).toFixed(1))

  return {
    originalSvg,
    optimizedSvg,
    originalBytes,
    optimizedBytes,
    savedPercent,
  }
}
