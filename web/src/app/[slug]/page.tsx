import {notFound, permanentRedirect} from 'next/navigation'

import {sanityClient} from '@/lib/sanity/client'
import {caseStudyPathBySlugQuery} from '@/lib/sanity/queries'
import type {CaseStudySection} from '@/lib/sanity/types'

// seo-check-ignore: redirect-only legacy route
type LegacySlugPageProps = {
  params: Promise<{
    slug: string
  }>
}

type LegacyCaseStudyPath = {
  slug?: string
  section: CaseStudySection
}

export default async function LegacySlugRedirectPage({params}: LegacySlugPageProps) {
  const {slug} = await params
  const item = await sanityClient.fetch<LegacyCaseStudyPath | null>(caseStudyPathBySlugQuery, {slug})

  if (!item?.slug) {
    notFound()
  }

  const basePath = item.section === 'designops' ? '/designops' : '/cases'
  permanentRedirect(`${basePath}/${item.slug}`)
}
