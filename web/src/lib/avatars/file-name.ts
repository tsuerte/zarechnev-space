import type { AvatarListItem } from "@/lib/sanity/types"

function sanitizeFileNameSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "avatar"
}

function createStableSuffix(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(36)
}

export function createAvatarFileName(item: AvatarListItem, extension: string) {
  const alt = sanitizeFileNameSegment(item.alt)
  const gender = sanitizeFileNameSegment(item.gender)
  const source = sanitizeFileNameSegment(item.sourceType)
  const suffix = createStableSuffix(item._id)

  return `${alt}-${gender}-${source}-${suffix}.${extension}`
}

export function createAvatarArchiveName(count: number) {
  return `avatars-${count}.zip`
}
