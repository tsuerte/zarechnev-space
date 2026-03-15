"use client"

import JSZip from "jszip"

import type { AvatarListItem } from "@/lib/sanity/types"

const URL_EXTENSION_RE = /\.([a-z0-9]+)(?:$|[?#])/i

function getAvatarUrl(item: AvatarListItem) {
  return item.image?.asset?.url ?? null
}

function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "avatar"
}

function inferExtension(url: string, blob: Blob) {
  const urlMatch = url.match(URL_EXTENSION_RE)?.[1]?.toLowerCase()

  if (urlMatch) {
    return urlMatch
  }

  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  }

  return mimeToExtension[blob.type] ?? "png"
}

function createFileName(item: AvatarListItem, extension: string, index: number) {
  const source = sanitizeFileNameSegment(item.sourceType)
  const kind = sanitizeFileNameSegment(item.kind)
  const alt = sanitizeFileNameSegment(item.alt || `${kind}-${index + 1}`)

  return `${alt}-${source}.${extension}`
}

async function fetchAvatarAsset(item: AvatarListItem) {
  const url = getAvatarUrl(item)

  if (!url) {
    throw new Error("У аватара нет файла изображения.")
  }

  let response: Response

  try {
    response = await fetch(url)
  } catch {
    const host = new URL(url).host

    throw new Error(
      `Не удалось запросить исходный файл аватара с ${host}. Похоже на блокировку прямого browser fetch (CORS).`
    )
  }

  if (!response.ok) {
    throw new Error(`Не удалось загрузить аватар (${response.status}).`)
  }

  let blob: Blob

  try {
    blob = await response.blob()
  } catch {
    throw new Error("Не удалось прочитать ответ изображения как blob.")
  }

  return {
    url,
    blob,
  }
}

function downloadBlob(fileName: string, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(objectUrl)
}

export async function downloadAvatarsZip(items: AvatarListItem[]) {
  const availableItems = items.filter((item) => Boolean(getAvatarUrl(item)))

  if (availableItems.length === 0) {
    throw new Error("Нет доступных аватаров для скачивания.")
  }

  const zip = new JSZip()

  const results = await Promise.all(
    availableItems.map(async (item, index) => {
      const { url, blob } = await fetchAvatarAsset(item)
      const extension = inferExtension(url, blob)
      const fileName = createFileName(item, extension, index)

      return {
        blob,
        fileName,
      }
    })
  )

  results.forEach((result) => {
    zip.file(result.fileName, result.blob)
  })

  const archive = await zip.generateAsync({ type: "blob" })
  const archiveName = `avatars-${results.length}.zip`

  downloadBlob(archiveName, archive)

  return {
    count: results.length,
  }
}
