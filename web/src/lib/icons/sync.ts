import { createHash } from "node:crypto"

import {
  downloadFigmaSvg,
  getFigmaImageExportUrls,
  getFigmaNodes,
  type FigmaNode,
} from "../figma/client"
import { runCanonicalSvgPipeline } from "../svg/pipeline"
import {
  acquireIconCatalogSyncLock,
  cleanupUnusedIconFiles,
  writeIconCatalogIndex,
  writeIconVariantFiles,
  readIconCatalogIndex,
} from "./storage"
import { ICONS_FIGMA_SOURCE } from "./config"
import {
  createCatalogNodeKey,
  createVariantKey,
  createVariantLabel,
  parseVariantPropsFromName,
  sortVariants,
  splitIconFullName,
  type IconCatalogIndex,
  type IconFamilyRecord,
  type IconVariantRecord,
} from "./types"

type ScannedVariant = {
  variantNodeId: string
  variantKey: string
  label: string
  props: Record<string, string>
}

type ScannedFamily = {
  id: string
  fullName: string
  group: string | null
  displayName: string
  familyNodeId: string
  variants: ScannedVariant[]
}

type SyncedFamilyState = "created" | "updated" | "unchanged"

type SyncResult = {
  syncedAt: string
  sourceChanged: boolean
  familyCount: number
  variantCount: number
  createdCount: number
  updatedCount: number
  unchangedCount: number
  orphanedCount: number
  skippedCount: number
  errors: string[]
}

const CONTAINER_NODE_TYPES = new Set(["CANVAS", "FRAME", "SECTION", "GROUP"])
const EXPORT_URL_BATCH_SIZE = 50
const NODE_FETCH_BATCH_SIZE = 50
const SVG_DOWNLOAD_CONCURRENCY = 6

function chunk<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}

async function mapWithConcurrency<T, TResult>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<TResult>
) {
  const results: TResult[] = new Array(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const workIndex = currentIndex
      currentIndex += 1
      results[workIndex] = await mapper(items[workIndex])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  )

  return results
}

function isVisible(node: Pick<FigmaNode, "visible">) {
  return node.visible !== false
}

function isContainerNode(node: Pick<FigmaNode, "type">) {
  return CONTAINER_NODE_TYPES.has(node.type)
}

function createVariantFileName(fileKey: string, variantNodeId: string) {
  return `${createCatalogNodeKey(fileKey, variantNodeId)}.svg`
}

function hashSvg(svg: string) {
  return createHash("sha1").update(svg).digest("hex")
}

function arePropsEqual(left: Record<string, string>, right: Record<string, string>) {
  const leftEntries = Object.entries(left).sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey)
  )
  const rightEntries = Object.entries(right).sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey)
  )

  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries)
}

function areVariantListsEqual(left: IconVariantRecord[], right: IconVariantRecord[]) {
  if (left.length !== right.length) {
    return false
  }

  const sortedLeft = sortVariants(left)
  const sortedRight = sortVariants(right)

  return sortedLeft.every((leftVariant, index) => {
    const rightVariant = sortedRight[index]

    return (
      leftVariant.variantNodeId === rightVariant.variantNodeId &&
      leftVariant.variantKey === rightVariant.variantKey &&
      leftVariant.label === rightVariant.label &&
      arePropsEqual(leftVariant.props, rightVariant.props) &&
      leftVariant.optimizedHash === rightVariant.optimizedHash
    )
  })
}

function familiesAreMetadataEqual(left: IconFamilyRecord, right: IconFamilyRecord) {
  return (
    left.fullName === right.fullName &&
    left.group === right.group &&
    left.displayName === right.displayName
  )
}

function hasSourceChanged(existingCatalog: IconCatalogIndex) {
  return (
    existingCatalog.source?.fileKey !== ICONS_FIGMA_SOURCE.fileKey ||
    existingCatalog.source?.pageId !== ICONS_FIGMA_SOURCE.pageId ||
    existingCatalog.source?.sectionId !== ICONS_FIGMA_SOURCE.sectionId
  )
}

async function fetchNodeChildren(fileKey: string, nodeIds: string[]) {
  const results = new Map<string, FigmaNode>()

  for (const batch of chunk(nodeIds, NODE_FETCH_BATCH_SIZE)) {
    const batchNodes = await getFigmaNodes(fileKey, batch, 1)

    for (const [nodeId, node] of batchNodes.entries()) {
      results.set(nodeId, node)
    }
  }

  return results
}

function createScannedFamily(fullName: string, familyNodeId: string, variants: ScannedVariant[]) {
  const { group, displayName } = splitIconFullName(fullName)

  return {
    id: createCatalogNodeKey(ICONS_FIGMA_SOURCE.fileKey, familyNodeId),
    fullName,
    group,
    displayName,
    familyNodeId,
    variants,
  }
}

function scanSingleComponentFamily(component: FigmaNode): ScannedFamily {
  return createScannedFamily(component.name, component.id, [
    {
      variantNodeId: component.id,
      variantKey: "default",
      label: "Default",
      props: {},
    },
  ])
}

function scanComponentSetFamily(
  componentSet: FigmaNode,
  componentSetChildren: Map<string, FigmaNode>
): ScannedFamily | null {
  const nodeWithChildren = componentSetChildren.get(componentSet.id)
  const variants = sortVariants(
    (nodeWithChildren?.children ?? [])
      .filter((child) => child.type === "COMPONENT" && isVisible(child))
      .map((child) => {
        const props = parseVariantPropsFromName(child.name)

        return {
          variantNodeId: child.id,
          variantKey: createVariantKey(props),
          label: createVariantLabel(props),
          props,
        }
      })
  )

  if (variants.length === 0) {
    return null
  }

  return createScannedFamily(componentSet.name, componentSet.id, variants)
}

async function scanSectionFamilies() {
  if (!ICONS_FIGMA_SOURCE.sectionId) {
    throw new Error("Icons source section is not configured.")
  }

  const queue = [ICONS_FIGMA_SOURCE.sectionId]
  const visited = new Set<string>()
  const singleComponents = new Map<string, FigmaNode>()
  const componentSets = new Map<string, FigmaNode>()

  while (queue.length > 0) {
    const batch = queue.splice(0, NODE_FETCH_BATCH_SIZE).filter((nodeId) => !visited.has(nodeId))

    if (batch.length === 0) {
      continue
    }

    for (const nodeId of batch) {
      visited.add(nodeId)
    }

    const nodes = await getFigmaNodes(ICONS_FIGMA_SOURCE.fileKey, batch, 1)

    for (const node of nodes.values()) {
      for (const child of node.children ?? []) {
        if (!isVisible(child)) {
          continue
        }

        if (child.type === "COMPONENT") {
          singleComponents.set(child.id, child)
          continue
        }

        if (child.type === "COMPONENT_SET") {
          componentSets.set(child.id, child)
          continue
        }

        if (isContainerNode(child)) {
          queue.push(child.id)
        }
      }
    }
  }

  const componentSetChildren =
    componentSets.size > 0
      ? await fetchNodeChildren(ICONS_FIGMA_SOURCE.fileKey, [...componentSets.keys()])
      : new Map<string, FigmaNode>()

  const scannedFamilies: ScannedFamily[] = []

  for (const component of singleComponents.values()) {
    scannedFamilies.push(scanSingleComponentFamily(component))
  }

  for (const componentSet of componentSets.values()) {
    const family = scanComponentSetFamily(componentSet, componentSetChildren)

    if (family) {
      scannedFamilies.push(family)
    }
  }

  return scannedFamilies
}

async function fetchVariantSvgMap(variantNodeIds: string[]) {
  const exportUrlMap = new Map<string, string>()

  for (const batch of chunk(variantNodeIds, EXPORT_URL_BATCH_SIZE)) {
    const exportUrls = await getFigmaImageExportUrls(ICONS_FIGMA_SOURCE.fileKey, batch)

    for (const [nodeId, url] of exportUrls.entries()) {
      exportUrlMap.set(nodeId, url)
    }
  }

  const svgEntries = await mapWithConcurrency(
    [...exportUrlMap.entries()],
    SVG_DOWNLOAD_CONCURRENCY,
    async ([nodeId, svgUrl]) => {
      const svg = await downloadFigmaSvg(svgUrl)

      return [nodeId, svg] as const
    }
  )

  return new Map(svgEntries)
}

function findExistingFamily(
  items: IconFamilyRecord[],
  scannedFamily: ScannedFamily,
  matchedFamilyNodeIds: Set<string>
) {
  const availableItems = items.filter((item) => !matchedFamilyNodeIds.has(item.familyNodeId))
  const directMatch = availableItems.find((item) => item.familyNodeId === scannedFamily.familyNodeId)

  if (directMatch) {
    return directMatch
  }

  const matchingByVariant = availableItems.filter((item) =>
    item.variants.some((variant) =>
      scannedFamily.variants.some(
        (scannedVariant) => scannedVariant.variantNodeId === variant.variantNodeId
      )
    )
  )

  return matchingByVariant.length === 1 ? matchingByVariant[0] : null
}

function resolveFamilyId(
  items: IconFamilyRecord[],
  existingFamily: IconFamilyRecord | null,
  scannedFamily: ScannedFamily
) {
  if (!existingFamily) {
    return scannedFamily.id
  }

  const duplicateIdCount = items.filter((item) => item.id === existingFamily.id).length

  if (duplicateIdCount > 1) {
    return scannedFamily.id
  }

  return existingFamily.id
}

function toVariantRecord(variant: ScannedVariant, optimizedSvg: string): IconVariantRecord {
  const fileName = createVariantFileName(ICONS_FIGMA_SOURCE.fileKey, variant.variantNodeId)

  return {
    id: createCatalogNodeKey(ICONS_FIGMA_SOURCE.fileKey, variant.variantNodeId),
    variantNodeId: variant.variantNodeId,
    variantKey: variant.variantKey,
    label: variant.label,
    props: variant.props,
    sourceFileName: fileName,
    optimizedFileName: fileName,
    optimizedHash: hashSvg(optimizedSvg),
  }
}

async function prepareFamilyVariants(
  scannedFamily: ScannedFamily,
  existingFamily: IconFamilyRecord | null,
  variantSvgMap: Map<string, string>
) {
  return Promise.all(
    scannedFamily.variants.map(async (variant) => {
      const svgSource = variantSvgMap.get(variant.variantNodeId)

      if (!svgSource) {
        throw new Error(`SVG export missing for variant ${variant.variantNodeId}.`)
      }

      const trimmedSvgSource = svgSource.trim()
      const svgOptimized = runCanonicalSvgPipeline(trimmedSvgSource)
      const record = toVariantRecord(variant, svgOptimized)
      const previousVariant = existingFamily?.variants.find(
        (existingVariant) => existingVariant.variantNodeId === variant.variantNodeId
      )

      if (!previousVariant || previousVariant.optimizedHash !== record.optimizedHash) {
        await writeIconVariantFiles({
          sourceFileName: record.sourceFileName,
          optimizedFileName: record.optimizedFileName,
          svgSource: trimmedSvgSource,
          svgOptimized,
        })
      }

      return record
    })
  )
}

function buildSyncedFamily(
  previousItems: IconFamilyRecord[],
  scannedFamily: ScannedFamily,
  existingFamily: IconFamilyRecord | null,
  preparedVariants: IconVariantRecord[],
  syncedAt: string
) {
  const nextFamilyBase: IconFamilyRecord = {
    id: resolveFamilyId(previousItems, existingFamily, scannedFamily),
    fullName: scannedFamily.fullName,
    group: scannedFamily.group,
    displayName: scannedFamily.displayName,
    figmaFileKey: ICONS_FIGMA_SOURCE.fileKey,
    familyNodeId: scannedFamily.familyNodeId,
    syncStatus: "synced",
    lastSyncedAt: syncedAt,
    lastSyncError: null,
    createdAt: existingFamily?.createdAt ?? syncedAt,
    updatedAt: existingFamily?.updatedAt ?? syncedAt,
    variants: sortVariants(preparedVariants),
  }

  const hasChanges =
    !existingFamily ||
    !familiesAreMetadataEqual(existingFamily, nextFamilyBase) ||
    !areVariantListsEqual(existingFamily.variants, nextFamilyBase.variants) ||
    existingFamily.syncStatus !== "synced" ||
    existingFamily.lastSyncError !== null

  const family: IconFamilyRecord = {
    ...nextFamilyBase,
    updatedAt: existingFamily ? (hasChanges ? syncedAt : existingFamily.updatedAt) : syncedAt,
  }

  const state: SyncedFamilyState = !existingFamily
    ? "created"
    : hasChanges
      ? "updated"
      : "unchanged"

  return {
    family,
    state,
  }
}

function createSyncErrorMessage(scannedFamily: ScannedFamily, error: unknown) {
  return error instanceof Error
    ? `${scannedFamily.fullName}: ${error.message}`
    : `${scannedFamily.fullName}: sync failed.`
}

function createSyncErrorFamily(
  existingFamily: IconFamilyRecord,
  syncedAt: string,
  message: string
): IconFamilyRecord {
  return {
    ...existingFamily,
    syncStatus: "sync-error",
    lastSyncedAt: syncedAt,
    lastSyncError: message,
  }
}

function collectOrphanedFamilies(
  previousItems: IconFamilyRecord[],
  matchedPreviousFamilyNodeIds: Set<string>,
  syncedAt: string
) {
  return previousItems
    .filter((family) => !matchedPreviousFamilyNodeIds.has(family.familyNodeId))
    .map((family) => ({
      ...family,
      syncStatus: "orphaned" as const,
      lastSyncedAt: syncedAt,
      lastSyncError: null,
      updatedAt: family.syncStatus === "orphaned" ? family.updatedAt : syncedAt,
    }))
}

function createNextCatalog(items: IconFamilyRecord[], syncedAt: string): IconCatalogIndex {
  return {
    version: 2,
    syncedAt,
    source: ICONS_FIGMA_SOURCE,
    items,
  }
}

function countSyncedFamilies(items: IconFamilyRecord[]) {
  return items.filter((item) => item.syncStatus !== "orphaned").length
}

function countSyncedVariants(items: IconFamilyRecord[]) {
  return items
    .filter((item) => item.syncStatus !== "orphaned")
    .reduce((sum, item) => sum + item.variants.length, 0)
}

export async function syncFigmaIconCatalog(): Promise<SyncResult> {
  const releaseLock = await acquireIconCatalogSyncLock()

  try {
    const syncedAt = new Date().toISOString()
    const existingCatalog = await readIconCatalogIndex()
    const sourceChanged = hasSourceChanged(existingCatalog)

    const previousItems = sourceChanged ? [] : existingCatalog.items
    const scannedFamilies = await scanSectionFamilies()
    const variantNodeIds = scannedFamilies.flatMap((family) =>
      family.variants.map((variant) => variant.variantNodeId)
    )
    const variantSvgMap = await fetchVariantSvgMap(variantNodeIds)

    const nextItems: IconFamilyRecord[] = []
    const matchedPreviousFamilyNodeIds = new Set<string>()
    const errors: string[] = []

    let createdCount = 0
    let updatedCount = 0
    let unchangedCount = 0
    let skippedCount = 0

    for (const scannedFamily of scannedFamilies) {
      const existingFamily = findExistingFamily(
        previousItems,
        scannedFamily,
        matchedPreviousFamilyNodeIds
      )

      try {
        const preparedVariants = await prepareFamilyVariants(
          scannedFamily,
          existingFamily,
          variantSvgMap
        )
        const { family: nextFamily, state } = buildSyncedFamily(
          previousItems,
          scannedFamily,
          existingFamily,
          preparedVariants,
          syncedAt
        )

        if (state === "created") {
          createdCount += 1
        } else if (state === "updated") {
          updatedCount += 1
        } else {
          unchangedCount += 1
        }

        nextItems.push(nextFamily)
        if (existingFamily) {
          matchedPreviousFamilyNodeIds.add(existingFamily.familyNodeId)
        }
      } catch (error) {
        skippedCount += 1
        const message = createSyncErrorMessage(scannedFamily, error)

        errors.push(message)

        if (existingFamily) {
          nextItems.push(createSyncErrorFamily(existingFamily, syncedAt, message))
          matchedPreviousFamilyNodeIds.add(existingFamily.familyNodeId)
        }
      }
    }

    const orphanedFamilies = collectOrphanedFamilies(
      previousItems,
      matchedPreviousFamilyNodeIds,
      syncedAt
    )
    const orphanedCount = orphanedFamilies.length
    nextItems.push(...orphanedFamilies)

    const nextCatalog = createNextCatalog(nextItems, syncedAt)

    await writeIconCatalogIndex(nextCatalog)
    await cleanupUnusedIconFiles(nextCatalog)

    return {
      syncedAt,
      sourceChanged,
      familyCount: countSyncedFamilies(nextItems),
      variantCount: countSyncedVariants(nextItems),
      createdCount,
      updatedCount,
      unchangedCount,
      orphanedCount,
      skippedCount,
      errors,
    }
  } finally {
    await releaseLock()
  }
}
