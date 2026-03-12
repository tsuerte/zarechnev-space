import { IconsWorkspace } from "@/components/icons/icons-workspace"
import { getPublicIconFamily, listPublicIconFamilies } from "@/lib/icons/storage"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Иконки",
  description: "Каталог SVG-иконок для интерфейсов.",
  path: "/lab/icons",
})

export default async function IconsPage() {
  const catalog = await listPublicIconFamilies()
  const initialSelectedIconId = catalog.icons[0]?.id ?? null
  const initialSelectedIcon = initialSelectedIconId
    ? await getPublicIconFamily(initialSelectedIconId)
    : null

  return (
    <IconsWorkspace
      initialIcons={catalog.icons}
      initialCatalogSyncedAt={catalog.syncedAt}
      initialSelectedIcon={initialSelectedIcon}
    />
  )
}
