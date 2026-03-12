process.loadEnvFile?.(".env.local")

async function main() {
  if (!process.env.FIGMA_ACCESS_TOKEN?.trim()) {
    console.error("FIGMA_ACCESS_TOKEN is missing.")
    process.exit(1)
  }

  const { syncFigmaIconCatalog } = await import("../src/lib/icons/sync")
  const result = await syncFigmaIconCatalog()

  console.log(`Icons synced at ${result.syncedAt}.`)
  console.log(
    `Families: ${result.familyCount}, variants: ${result.variantCount}, created: ${result.createdCount}, updated: ${result.updatedCount}, unchanged: ${result.unchangedCount}, orphaned: ${result.orphanedCount}, skipped: ${result.skippedCount}.`
  )

  if (result.sourceChanged) {
    console.log("Catalog source changed, previous source data was replaced.")
  }

  if (result.errors.length > 0) {
    console.error("Sync completed with errors:")
    for (const error of result.errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error("Icons sync failed:", error)
  process.exit(1)
})
