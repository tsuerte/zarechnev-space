export type IconSyncStatus = "synced" | "sync-error" | "orphaned" | "never-synced"

export type IconCatalogSource = {
  fileKey: string
  pageId: string
  pageName: string
  sectionId: string | null
  sectionName: string | null
}

export type IconVariantRecord = {
  id: string
  variantNodeId: string
  variantKey: string
  label: string
  props: Record<string, string>
  sourceFileName: string
  optimizedFileName: string
  optimizedHash: string
}

export type IconFamilyRecord = {
  id: string
  fullName: string
  group: string | null
  displayName: string
  figmaFileKey: string
  familyNodeId: string
  syncStatus: IconSyncStatus
  lastSyncedAt: string | null
  lastSyncError: string | null
  createdAt: string
  updatedAt: string
  variants: IconVariantRecord[]
}

export type IconCatalogIndex = {
  version: 2
  syncedAt: string | null
  source: IconCatalogSource | null
  items: IconFamilyRecord[]
}

export type IconVariantSummary = Pick<IconVariantRecord, "id" | "variantKey" | "label" | "props">

export type IconVariantDetail = Omit<
  IconVariantRecord,
  "sourceFileName" | "optimizedFileName" | "optimizedHash"
> & {
  svgSource: string
  svgOptimized: string
}

export type IconFamilySummary = Omit<IconFamilyRecord, "variants" | "lastSyncError"> & {
  previewVariantId: string
  previewSvgOptimized: string
  variants: IconVariantSummary[]
}

export type IconFamilyDetail = Omit<IconFamilyRecord, "variants"> & {
  variants: IconVariantDetail[]
}

export function createCatalogNodeKey(fileKey: string, nodeId: string) {
  return `${fileKey}__${nodeId.replace(/:/g, "-")}`
}

export function createFigmaNodeUrl(fileKey: string, nodeId: string) {
  return `https://www.figma.com/design/${fileKey}/source?node-id=${encodeURIComponent(nodeId.replace(/:/g, "-"))}`
}

export function splitIconFullName(fullName: string) {
  const separator = " / "
  const separatorIndex = fullName.indexOf(separator)

  if (separatorIndex === -1) {
    return {
      group: null,
      displayName: fullName.trim(),
    }
  }

  const group = fullName.slice(0, separatorIndex).trim()
  const displayName = fullName.slice(separatorIndex + separator.length).trim()

  return {
    group: group || null,
    displayName: displayName || fullName.trim(),
  }
}

export function parseVariantPropsFromName(name: string) {
  const entries = name
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [rawKey, ...rawValueParts] = part.split("=")
      const key = rawKey?.trim().toLowerCase()
      const value = rawValueParts.join("=").trim()

      if (!key || !value) {
        return null
      }

      return [key, value] as const
    })
    .filter((entry): entry is readonly [string, string] => entry !== null)

  return Object.fromEntries(entries)
}

export function createVariantKey(props: Record<string, string>) {
  const entries = Object.entries(props).sort(([left], [right]) => left.localeCompare(right))

  if (entries.length === 0) {
    return "default"
  }

  return entries.map(([key, value]) => `${key}=${value}`).join(", ")
}

export function createVariantLabel(props: Record<string, string>) {
  const entries = Object.entries(props).sort(([left], [right]) => left.localeCompare(right))

  if (entries.length === 0) {
    return "Default"
  }

  if (entries.length === 1) {
    return entries[0][1]
  }

  return entries.map(([key, value]) => `${key}=${value}`).join(" / ")
}

export function sortFamilies<T extends Pick<IconFamilyRecord, "group" | "displayName" | "fullName">>(
  items: T[]
) {
  return [...items].sort((left, right) => {
    const leftGroup = left.group ?? "zzz"
    const rightGroup = right.group ?? "zzz"
    const groupComparison = leftGroup.localeCompare(rightGroup, "en", { sensitivity: "base" })

    if (groupComparison !== 0) {
      return groupComparison
    }

    const displayComparison = left.displayName.localeCompare(right.displayName, "en", {
      sensitivity: "base",
    })

    if (displayComparison !== 0) {
      return displayComparison
    }

    return left.fullName.localeCompare(right.fullName, "en", { sensitivity: "base" })
  })
}

export function sortVariants<T extends Pick<IconVariantRecord, "label" | "props" | "variantKey">>(
  items: T[]
) {
  return [...items].sort((left, right) => {
    const leftSize = Number(left.props.size)
    const rightSize = Number(right.props.size)

    if (Number.isFinite(leftSize) && Number.isFinite(rightSize) && leftSize !== rightSize) {
      return leftSize - rightSize
    }

    if (Number.isFinite(leftSize) && !Number.isFinite(rightSize)) {
      return -1
    }

    if (!Number.isFinite(leftSize) && Number.isFinite(rightSize)) {
      return 1
    }

    const labelComparison = left.label.localeCompare(right.label, "en", { sensitivity: "base" })

    if (labelComparison !== 0) {
      return labelComparison
    }

    return left.variantKey.localeCompare(right.variantKey, "en", { sensitivity: "base" })
  })
}
