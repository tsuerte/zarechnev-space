import JSZip from "jszip"
import { NextResponse } from "next/server"

import { createAvatarArchiveName, createAvatarFileName } from "@/lib/avatars/file-name"
import { consumeRateLimit, getRateLimitKey } from "@/lib/server/rate-limit"
import { sanityClient } from "@/lib/sanity/client"
import { avatarsByIdsQuery } from "@/lib/sanity/queries"
import type { AvatarListItem } from "@/lib/sanity/types"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10
const MAX_AVATAR_IDS = 200
const URL_EXTENSION_RE = /\.([a-z0-9]+)(?:$|[?#])/i

type DownloadRequestPayload = {
  ids?: unknown
}

function inferExtension(url: string, contentType: string | null) {
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

  return mimeToExtension[contentType ?? ""] ?? "png"
}

function getAvatarIds(payload: DownloadRequestPayload) {
  if (!Array.isArray(payload.ids)) {
    throw new Error("Нужно передать список avatar id.")
  }

  const ids = [...new Set(payload.ids.filter((item): item is string => typeof item === "string"))]

  if (ids.length === 0) {
    throw new Error("Список avatar id пуст.")
  }

  if (ids.length > MAX_AVATAR_IDS) {
    throw new Error(`Можно скачать не больше ${MAX_AVATAR_IDS} аватаров за раз.`)
  }

  return ids
}

async function fetchAvatarAsset(item: AvatarListItem) {
  const url = item.image?.asset?.url

  if (!url) {
    throw new Error("У аватара нет файла изображения.")
  }

  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`Не удалось загрузить аватар (${response.status}).`)
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    extension: inferExtension(url, response.headers.get("content-type")),
  }
}

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

    const payload = (await request.json()) as DownloadRequestPayload
    const ids = getAvatarIds(payload)
    const avatars = await sanityClient.fetch<AvatarListItem[]>(avatarsByIdsQuery, { ids })

    if (avatars.length === 0) {
      return NextResponse.json({ error: "Подходящие аватары не найдены." }, { status: 404 })
    }

    const orderById = new Map(ids.map((id, index) => [id, index]))
    const orderedAvatars = avatars
      .filter((item) => orderById.has(item._id))
      .sort((left, right) => (orderById.get(left._id) ?? 0) - (orderById.get(right._id) ?? 0))

    const zip = new JSZip()

    await Promise.all(
      orderedAvatars.map(async (item) => {
        const { buffer, extension } = await fetchAvatarAsset(item)
        zip.file(createAvatarFileName(item, extension), buffer)
      })
    )

    const archive = await zip.generateAsync({ type: "nodebuffer" })
    const archiveBytes = new Uint8Array(archive)
    const archiveName = createAvatarArchiveName(orderedAvatars.length)

    return new NextResponse(archiveBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`,
        "Cache-Control": "no-store",
        "X-Archive-Name": archiveName,
        "X-Avatar-Count": String(orderedAvatars.length),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось собрать ZIP с аватарами."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
