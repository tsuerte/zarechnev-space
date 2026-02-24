import { promises as fs } from "node:fs"
import path from "node:path"

const appDir = path.resolve(process.cwd(), "src", "app")
const pageFileName = "page.tsx"
const ignoreMarker = "seo-check-ignore"

async function collectPageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectPageFiles(fullPath)))
      continue
    }

    if (entry.isFile() && entry.name === pageFileName) {
      files.push(fullPath)
    }
  }

  return files
}

function hasMetadataExport(source) {
  return (
    /export\s+const\s+metadata\s*(?::[^=]+)?=/.test(source) ||
    /export\s+(async\s+)?function\s+generateMetadata\s*\(/.test(source)
  )
}

function toRelative(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/")
}

async function main() {
  const pageFiles = await collectPageFiles(appDir)
  const missing = []

  for (const filePath of pageFiles) {
    const source = await fs.readFile(filePath, "utf8")
    if (source.includes(ignoreMarker)) {
      continue
    }
    if (!hasMetadataExport(source)) {
      missing.push(toRelative(filePath))
    }
  }

  if (missing.length === 0) {
    console.log("SEO metadata check passed.")
    process.exit(0)
  }

  console.error("SEO metadata check failed.")
  console.error("Add `metadata` or `generateMetadata` export in:")
  for (const file of missing) {
    console.error(`- ${file}`)
  }
  console.error(
    "\nIf a page intentionally has no metadata (for example redirect-only), add comment: // seo-check-ignore"
  )
  process.exit(1)
}

main().catch((error) => {
  console.error("SEO metadata check crashed:", error)
  process.exit(1)
})
