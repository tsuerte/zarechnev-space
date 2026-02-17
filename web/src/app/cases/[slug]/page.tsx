import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import {PortableTextRenderer} from '@/components/portable-text'
import {sanityClient} from '@/lib/sanity/client'
import {formatPublishedDate} from '@/lib/date'
import {caseStudyBySlugQuery, caseStudySlugsQuery} from '@/lib/sanity/queries'
import type {CaseStudy} from '@/lib/sanity/types'

type PageParams = {
  slug: string
}

type CaseStudySlug = {
  slug: string
}

export const revalidate = 300

async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return sanityClient.fetch<CaseStudy | null>(caseStudyBySlugQuery, {slug})
}

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<CaseStudySlug[]>(caseStudySlugsQuery)
  return slugs.map((item) => ({slug: item.slug}))
}

export async function generateMetadata({params}: {params: Promise<PageParams>}): Promise<Metadata> {
  const {slug} = await params
  const item = await getCaseStudy(slug)

  if (!item) {
    return {
      title: 'Not found',
    }
  }

  return {
    title: item.title,
    description: item.excerpt || item.title,
  }
}

export default async function CaseStudyPage({params}: {params: Promise<PageParams>}) {
  const {slug} = await params
  const item = await getCaseStudy(slug)

  if (!item) {
    notFound()
  }

  const coverUrl = item.coverImage?.asset?.url
  const coverWidth = item.coverImage?.asset?.metadata?.dimensions?.width ?? 1200
  const coverHeight = item.coverImage?.asset?.metadata?.dimensions?.height ?? 675

  return (
    <main className="case-study-main">
      <article>
        <h1 className="case-study-title">{item.title}</h1>

        <div className="case-study-meta">{formatPublishedDate(item.publishedAt)}</div>

        {item.categories?.length ? (
          <div className="case-study-meta case-study-category-list">
            {item.categories.map((category, index) => {
              if (!category.slug) {
                return <span key={`${category.title}-${index}`}>{category.title}</span>
              }

              return (
                <Link key={category.slug} href={`/cases?category=${encodeURIComponent(category.slug)}`}>
                  {category.title}
                </Link>
              )
            })}
          </div>
        ) : null}

        {item.excerpt ? <p className="case-study-excerpt">{item.excerpt}</p> : null}

        {coverUrl && item.coverImage?.alt ? (
          <figure className="case-study-cover">
            <Image
              src={coverUrl}
              alt={item.coverImage.alt}
              width={coverWidth}
              height={coverHeight}
              className="case-study-cover-image"
              placeholder={item.coverImage.asset?.metadata?.lqip ? 'blur' : 'empty'}
              blurDataURL={item.coverImage.asset?.metadata?.lqip}
              priority
            />
            {item.coverImage.caption ? <figcaption className="pt-caption">{item.coverImage.caption}</figcaption> : null}
          </figure>
        ) : null}

        {item.body?.length ? <PortableTextRenderer value={item.body} /> : <p>Content is empty.</p>}
      </article>
    </main>
  )
}
