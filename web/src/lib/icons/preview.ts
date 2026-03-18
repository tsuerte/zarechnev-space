export const DEFAULT_ICON_PREVIEW_COLOR = "#121212"
export const ICON_DETAIL_PREVIEW_SIZE_MIN = 16
export const ICON_DETAIL_PREVIEW_SIZE_MAX = 96
export const ICON_DETAIL_PREVIEW_SIZE_STEP = 4
export const ICON_DETAIL_PREVIEW_STROKE_MIN = 1
export const ICON_DETAIL_PREVIEW_STROKE_MAX = 2
export const ICON_DETAIL_PREVIEW_STROKE_STEP = 0.25

function formatStrokeWidth(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, "")
}

export function extractIconPreviewColor(svg: string) {
  const match = svg.match(/\b(?:stroke|fill)="(?!none\b)([^"]+)"/i)
  return match?.[1] ?? DEFAULT_ICON_PREVIEW_COLOR
}

export function createCustomizedIconPreviewSvg(
  svg: string,
  options: {
    color: string
    strokeWidth: number
  }
) {
  const strokeWidth = formatStrokeWidth(options.strokeWidth)
  let nextSvg = svg

  nextSvg = nextSvg.replace(/\bstroke="(?!none\b)[^"]*"/gi, `stroke="${options.color}"`)
  nextSvg = nextSvg.replace(/\bfill="(?!none\b)[^"]*"/gi, `fill="${options.color}"`)

  const svgWithStrokeWidth = nextSvg.replace(
    /\bstroke-width="[^"]*"/gi,
    `stroke-width="${strokeWidth}"`
  )

  if (svgWithStrokeWidth !== nextSvg) {
    return svgWithStrokeWidth
  }

  if (/\bstroke="(?!none\b)[^"]*"/i.test(nextSvg)) {
    return nextSvg.replace("<svg ", `<svg stroke-width="${strokeWidth}" `)
  }

  return nextSvg
}
