import { Suspense } from "react"
import { unstable_cache } from "next/cache"

import { CasesBrowser } from "@/components/cases-browser"
import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudiesListQuery, categoriesQuery } from "@/lib/sanity/queries"
import type { CaseCategory, CaseStudyListItem } from "@/lib/sanity/types"

export const metadata = buildMetadata({
  title: "Кейсы",
  description: "Каталог кейсов с фильтрацией по категориям.",
  path: "/cases",
})

export const revalidate = 300

const getCaseStudiesCached = unstable_cache(
  async () => sanityClient.fetch<CaseStudyListItem[]>(caseStudiesListQuery),
  ["cases-list"],
  { revalidate: 300 }
)

const getCategories = unstable_cache(
  async () => sanityClient.fetch<CaseCategory[]>(categoriesQuery),
  ["cases-categories"],
  { revalidate: 300 }
)

async function getCaseStudies(): Promise<CaseStudyListItem[]> {
  return getCaseStudiesCached()
}

export default async function CasesPage() {
  const [caseStudies, categories] = await Promise.all([
    getCaseStudies(),
    getCategories(),
  ])

  return (
    <main className="w-full">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка кейсов...</p>}>
        <CasesBrowser caseStudies={caseStudies} categories={categories} />
      </Suspense>
    </main>
  )
}
