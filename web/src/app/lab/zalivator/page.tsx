import { ZalivatorWorkspace } from "@/components/zalivator/zalivator-workspace"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Zalivator",
  description: "Генератор текстовых мок-данных для макетов и плагина.",
  path: "/lab/zalivator",
  type: "article",
})

export default function ZalivatorPage() {
  return <ZalivatorWorkspace />
}
