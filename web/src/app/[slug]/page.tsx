import {permanentRedirect} from 'next/navigation'

// seo-check-ignore: redirect-only legacy route
type LegacySlugPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function LegacySlugRedirectPage({params}: LegacySlugPageProps) {
  const {slug} = await params
  permanentRedirect(`/cases/${slug}`)
}
