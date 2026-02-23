import { Suspense } from "react"
import { unstable_cache } from "next/cache"

import { CasesBrowser } from "@/components/cases-browser"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudiesListQuery, categoriesQuery } from "@/lib/sanity/queries"
import type { CaseCategory, CaseStudyListItem } from "@/lib/sanity/types"
import { Separator } from "@/ui-kit"

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
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Кейсы</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Все кейсы с фильтром по категориям через URL-параметр
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">?category=...</code>
          без серверного перезапроса.
        </p>
      </header>

      <Separator />

      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка кейсов...</p>}>
        <CasesBrowser caseStudies={caseStudies} categories={categories} />
      </Suspense>
    </main>
  )
}
