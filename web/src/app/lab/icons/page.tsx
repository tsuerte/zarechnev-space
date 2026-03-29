import { IconsWorkspace } from "@/components/icons/icons-workspace"
import { listPublicIconFamilies } from "@/lib/icons/storage"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Иконки",
  description: "Каталог SVG-иконок для интерфейсов.",
  path: "/lab/icons",
})

export default async function IconsPage() {
  const catalog = await listPublicIconFamilies()

  return (
    <IconsWorkspace
      initialIcons={catalog.icons}
      initialCatalogSyncedAt={catalog.syncedAt}
    />
  )
}
