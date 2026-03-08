export function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`
  }

  return `${(value / 1024).toFixed(1)} KB`
}

export function formatSavedBytes(value: number) {
  const abs = Math.abs(value)
  return value <= 0 ? `-${formatBytes(abs)}` : formatBytes(abs)
}

export function createSvgPreviewUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function createPastedSvgFile(svg: string) {
  return new File([svg], "pasted-svg.svg", {
    type: "image/svg+xml;charset=utf-8",
  })
}

export function buildOptimizedSvgFileName(fileName: string) {
  const baseName = fileName.replace(/\.svg$/i, "")
  return `${baseName}.optimized.svg`
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable
  )
}
