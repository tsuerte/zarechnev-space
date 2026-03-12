import type { IconCatalogSource } from "./types"

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required env var: ${name}. Configure it in web/.env.local.`)
  }

  return value
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim()

  return value ? value : null
}

export const ICONS_FIGMA_SOURCE: IconCatalogSource = {
  fileKey: readRequiredEnv("FIGMA_ICONS_FILE_KEY"),
  pageId: readRequiredEnv("FIGMA_ICONS_PAGE_ID"),
  pageName: readRequiredEnv("FIGMA_ICONS_PAGE_NAME"),
  sectionId: readOptionalEnv("FIGMA_ICONS_SECTION_ID"),
  sectionName: readOptionalEnv("FIGMA_ICONS_SECTION_NAME"),
}
