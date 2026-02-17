import {Suspense} from 'react'
import {unstable_cache} from 'next/cache'

import {CasesBrowser} from '@/components/cases-browser'
import {sanityClient} from '@/lib/sanity/client'
import {caseStudiesListQuery, categoriesQuery} from '@/lib/sanity/queries'
import type {CaseCategory, CaseStudyListItem} from '@/lib/sanity/types'

export const revalidate = 300

const getCaseStudiesCached = unstable_cache(
  async () => sanityClient.fetch<CaseStudyListItem[]>(caseStudiesListQuery),
  ['cases-list'],
  {revalidate: 300},
)

const getCategories = unstable_cache(
  async () => sanityClient.fetch<CaseCategory[]>(categoriesQuery),
  ['cases-categories'],
  {revalidate: 300},
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
    <main className="cases-main">
      <h1 className="cases-title">Cases</h1>
      <p className="cases-subtitle">
        Все кейсы. Фильтр работает по категории через URL параметр <code>?category=...</code> без
        серверного перезапроса.
      </p>

      <Suspense fallback={<p>Loading cases...</p>}>
        <CasesBrowser caseStudies={caseStudies} categories={categories} />
      </Suspense>
    </main>
  )
}
