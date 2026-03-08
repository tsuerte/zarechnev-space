export const MAX_SVG_FILE_SIZE = 5 * 1024 * 1024
export const MAX_SVG_BATCH_FILES = 10
export const MAX_SVG_BATCH_TOTAL_SIZE = 20 * 1024 * 1024

export function isSvgUploadFile(file: File) {
  const looksLikeSvgFile = file.name.toLowerCase().endsWith(".svg")
  const hasSvgMimeType = file.type === "" || file.type.startsWith("image/svg+xml")

  return looksLikeSvgFile && hasSvgMimeType
}

export function getSvgUploadError(file: File) {
  if (!isSvgUploadFile(file)) {
    return "Нужен SVG файл."
  }

  if (file.size > MAX_SVG_FILE_SIZE) {
    return "SVG файл слишком большой. Лимит: 5 MB."
  }

  return null
}
