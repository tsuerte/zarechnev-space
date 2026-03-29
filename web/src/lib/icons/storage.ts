import { mkdir, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  sortFamilies,
  sortVariants,
  type IconCatalogIndex,
  type IconCatalogSource,
  type IconFamilyDetail,
  type IconFamilyRecord,
  type IconFamilySummary,
  type IconVariantDetail,
  type IconVariantSummary,
} from "./types"

const ICONS_ROOT = path.join(process.cwd(), "data", "icons")
const SOURCE_ROOT = path.join(ICONS_ROOT, "source")
const OPTIMIZED_ROOT = path.join(ICONS_ROOT, "optimized")
const METADATA_PATH = path.join(ICONS_ROOT, "index.json")
const METADATA_TEMP_PATH = path.join(ICONS_ROOT, "index.json.tmp")
const SYNC_LOCK_PATH = path.join(ICONS_ROOT, ".sync.lock")

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error
}

function createEmptyCatalog(source: IconCatalogSource | null = null): IconCatalogIndex {
  return {
    version: 2,
    syncedAt: null,
    source,
    items: [],
  }
}

function isCurrentCatalog(value: unknown): value is IconCatalogIndex {
  if (!value || typeof value !== "object") {
    return false
  }

  return (
    "version" in value &&
    (value as { version?: unknown }).version === 2 &&
    "items" in value &&
    Array.isArray((value as { items?: unknown }).items)
  )
}

function normalizeCatalog(value: unknown): IconCatalogIndex {
  if (!isCurrentCatalog(value)) {
    throw new Error("Icon catalog metadata is invalid.")
  }

  return {
    version: 2 as const,
    syncedAt: value.syncedAt ?? null,
    source: value.source ?? null,
    items: value.items,
  }
}

async function ensureStoreDirs() {
  await mkdir(SOURCE_ROOT, { recursive: true })
  await mkdir(OPTIMIZED_ROOT, { recursive: true })
}

async function readRawMetadata() {
  try {
    return await readFile(METADATA_PATH, "utf8")
  } catch (error) {
    if (isErrorWithCode(error) && error.code === "ENOENT") {
      return null
    }

    throw error
  }
}

async function writeMetadata(index: IconCatalogIndex) {
  await ensureStoreDirs()
  const payload = JSON.stringify(index, null, 2)

  await writeFile(METADATA_TEMP_PATH, payload, "utf8")
  await rename(METADATA_TEMP_PATH, METADATA_PATH)
}

export async function readIconCatalogIndex() {
  await ensureStoreDirs()
  const rawMetadata = await readRawMetadata()

  if (rawMetadata === null) {
    return createEmptyCatalog(null)
  }

  let parsedMetadata: unknown

  try {
    parsedMetadata = JSON.parse(rawMetadata) as unknown
  } catch (error) {
    throw new Error(
      `Failed to parse icon catalog metadata at ${METADATA_PATH}: ${
        error instanceof Error ? error.message : "Unknown JSON error."
      }`
    )
  }

  return normalizeCatalog(parsedMetadata)
}

export async function writeIconCatalogIndex(index: IconCatalogIndex) {
  await writeMetadata(index)
}

export async function acquireIconCatalogSyncLock() {
  await ensureStoreDirs()

  try {
    const handle = await open(SYNC_LOCK_PATH, "wx")

    await handle.writeFile(String(process.pid))

    return async () => {
      await handle.close()
      await rm(SYNC_LOCK_PATH, { force: true })
    }
  } catch (error) {
    if (isErrorWithCode(error) && error.code === "EEXIST") {
      throw new Error(`Icons sync is already running. Lock file: ${SYNC_LOCK_PATH}`)
    }

    throw error
  }
}

function getReferencedIconFiles(index: IconCatalogIndex) {
  const sourceFiles = new Set<string>()
  const optimizedFiles = new Set<string>()

  for (const family of index.items) {
    for (const variant of family.variants) {
      sourceFiles.add(variant.sourceFileName)
      optimizedFiles.add(variant.optimizedFileName)
    }
  }

  return {
    sourceFiles,
    optimizedFiles,
  }
}

function isPublicFamily(family: IconFamilyRecord) {
  return family.syncStatus !== "orphaned" && family.variants.length > 0
}

function resolveSourcePath(fileName: string) {
  return path.join(SOURCE_ROOT, fileName)
}

function resolveOptimizedPath(fileName: string) {
  return path.join(OPTIMIZED_ROOT, fileName)
}

async function readOptimizedVariantFile(optimizedFileName: string) {
  return readFile(resolveOptimizedPath(optimizedFileName), "utf8")
}

async function readSourceVariantFile(sourceFileName: string) {
  return readFile(resolveSourcePath(sourceFileName), "utf8")
}

export async function writeIconVariantFiles({
  sourceFileName,
  optimizedFileName,
  svgSource,
  svgOptimized,
}: {
  sourceFileName: string
  optimizedFileName: string
  svgSource: string
  svgOptimized: string
}) {
  await ensureStoreDirs()

  await Promise.all([
    writeFile(resolveSourcePath(sourceFileName), svgSource, "utf8"),
    writeFile(resolveOptimizedPath(optimizedFileName), svgOptimized, "utf8"),
  ])
}

export async function cleanupUnusedIconFiles(index: IconCatalogIndex) {
  await ensureStoreDirs()

  const { sourceFiles: referencedSourceFiles, optimizedFiles: referencedOptimizedFiles } =
    getReferencedIconFiles(index)
  const [sourceFiles, optimizedFiles] = await Promise.all([
    readdir(SOURCE_ROOT),
    readdir(OPTIMIZED_ROOT),
  ])

  const staleSourceFiles = sourceFiles.filter(
    (fileName) => fileName.endsWith(".svg") && !referencedSourceFiles.has(fileName)
  )
  const staleOptimizedFiles = optimizedFiles.filter(
    (fileName) => fileName.endsWith(".svg") && !referencedOptimizedFiles.has(fileName)
  )

  await Promise.all([
    ...staleSourceFiles.map((fileName) => rm(resolveSourcePath(fileName), { force: true })),
    ...staleOptimizedFiles.map((fileName) => rm(resolveOptimizedPath(fileName), { force: true })),
  ])
}

function toVariantSummary(variants: IconFamilyRecord["variants"]): IconVariantSummary[] {
  return variants.map((variant) => ({
    id: variant.id,
    variantKey: variant.variantKey,
    label: variant.label,
    props: variant.props,
  }))
}

export async function listPublicIconFamilies() {
  const catalog = await readIconCatalogIndex()
  const items = sortFamilies(catalog.items.filter(isPublicFamily))

  const icons = await Promise.all(
    items.map(async (family): Promise<IconFamilySummary> => {
      const sortedVariants = sortVariants(family.variants)
      const previewVariant = sortedVariants[0]
      const previewSvgOptimized = await readFile(
        resolveOptimizedPath(previewVariant.optimizedFileName),
        "utf8"
      )

      return {
        id: family.id,
        fullName: family.fullName,
        group: family.group,
        displayName: family.displayName,
        figmaFileKey: family.figmaFileKey,
        familyNodeId: family.familyNodeId,
        syncStatus: family.syncStatus,
        lastSyncedAt: family.lastSyncedAt,
        createdAt: family.createdAt,
        updatedAt: family.updatedAt,
        previewVariantId: previewVariant.id,
        previewSvgOptimized,
        variants: toVariantSummary(sortedVariants),
      }
    })
  )

  return {
    icons,
    syncedAt: catalog.syncedAt,
    source: catalog.source,
  }
}

export async function getPublicIconFamily(id: string): Promise<IconFamilyDetail | null> {
  const catalog = await readIconCatalogIndex()
  const family = catalog.items.find((item) => item.id === id)

  if (!family || !isPublicFamily(family)) {
    return null
  }

  const variants = await Promise.all(
    sortVariants(family.variants).map(async (variant): Promise<IconVariantDetail> => {
      const [svgOptimized, svgSource] = await Promise.all([
        readOptimizedVariantFile(variant.optimizedFileName),
        readSourceVariantFile(variant.sourceFileName),
      ])

      return {
        id: variant.id,
        variantNodeId: variant.variantNodeId,
        variantKey: variant.variantKey,
        label: variant.label,
        props: variant.props,
        svgOptimized,
        svgSource,
      }
    })
  )

  return {
    id: family.id,
    fullName: family.fullName,
    group: family.group,
    displayName: family.displayName,
    figmaFileKey: family.figmaFileKey,
    familyNodeId: family.familyNodeId,
    syncStatus: family.syncStatus,
    lastSyncedAt: family.lastSyncedAt,
    lastSyncError: family.lastSyncError,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
    variants,
  }
}
