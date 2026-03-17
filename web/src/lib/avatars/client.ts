"use client"

import { createAvatarArchiveName } from "@/lib/avatars/file-name"
import type { AvatarListItem } from "@/lib/sanity/types"

function getDownloadArchiveName(response: Response, fallbackCount: number) {
  return response.headers.get("x-archive-name") ?? createAvatarArchiveName(fallbackCount)
}

function getDownloadCount(response: Response, fallbackCount: number) {
  const rawCount = response.headers.get("x-avatar-count")
  const parsedCount = rawCount ? Number.parseInt(rawCount, 10) : Number.NaN

  return Number.isFinite(parsedCount) ? parsedCount : fallbackCount
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
  const avatarIds = [...new Set(items.map((item) => item._id))]

  if (avatarIds.length === 0) {
    throw new Error("Нет доступных аватаров для скачивания.")
  }

  const response = await fetch("/api/avatars/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: avatarIds }),
  })

  if (!response.ok) {
    try {
      const payload = (await response.json()) as { error?: string }
      throw new Error(payload.error || "Не удалось собрать ZIP с аватарами.")
    } catch (error) {
      throw error instanceof Error ? error : new Error("Не удалось собрать ZIP с аватарами.")
    }
  }

  const archive = await response.blob()
  const archiveName = getDownloadArchiveName(response, avatarIds.length)
  const count = getDownloadCount(response, avatarIds.length)

  downloadBlob(archiveName, archive)

  return {
    count,
  }
}
