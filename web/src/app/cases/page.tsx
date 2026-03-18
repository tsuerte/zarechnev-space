import { Suspense } from "react"
import { unstable_cache } from "next/cache"

import { CasesBrowser } from "@/components/cases-browser"
import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudiesListQuery } from "@/lib/sanity/queries"
import type { CaseStudyListItem } from "@/lib/sanity/types"

export const metadata = buildMetadata({
  title: "Кейсы",
  description: "Каталог кейсов.",
  path: "/cases",
})

export const revalidate = 300

const getCaseStudiesCached = unstable_cache(
  async () => sanityClient.fetch<CaseStudyListItem[]>(caseStudiesListQuery),
  ["cases-list"],
  { revalidate: 300 }
)

async function getCaseStudies(): Promise<CaseStudyListItem[]> {
  return getCaseStudiesCached()
}

export default async function CasesPage() {
  const caseStudies = await getCaseStudies()

  return (
    <main className="w-full">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка кейсов...</p>}>
        <CasesBrowser caseStudies={caseStudies} />
      </Suspense>
    </main>
  )
}
