import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PortableTextRenderer } from "@/components/portable-text"
import { formatPublishedDate } from "@/lib/date"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudyBySlugQuery, caseStudySlugsQuery } from "@/lib/sanity/queries"
import type { CaseStudy } from "@/lib/sanity/types"
import { Badge, Separator } from "@/ui-kit"

type PageParams = {
  slug: string
}

type CaseStudySlug = {
  slug: string
}

export const revalidate = 300

async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return sanityClient.fetch<CaseStudy | null>(caseStudyBySlugQuery, { slug })
}

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<CaseStudySlug[]>(caseStudySlugsQuery)
  return slugs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getCaseStudy(slug)

  if (!item) {
    return {
      title: "Not found",
    }
  }

  return {
    title: item.title,
    description: item.excerpt || item.title,
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { slug } = await params
  const item = await getCaseStudy(slug)

  if (!item) {
    notFound()
  }

  const coverUrl = item.coverImage?.asset?.url
  const coverWidth = item.coverImage?.asset?.metadata?.dimensions?.width ?? 1200
  const coverHeight = item.coverImage?.asset?.metadata?.dimensions?.height ?? 675

  return (
    <main className="mx-auto w-full max-w-3xl">
      <article className="space-y-7">
        <header className="space-y-3">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {item.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {formatPublishedDate(item.publishedAt)}
          </p>

          {item.categories?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {item.categories.map((category, index) => {
                if (!category.slug) {
                  return (
                    <Badge key={`${category.title}-${index}`} variant="outline">
                      {category.title}
                    </Badge>
                  )
                }

                return (
                  <Badge key={category.slug} asChild variant="outline">
                    <Link href={`/cases?category=${encodeURIComponent(category.slug)}`}>
                      {category.title}
                    </Link>
                  </Badge>
                )
              })}
            </div>
          ) : null}

          {item.excerpt ? (
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {item.excerpt}
            </p>
          ) : null}
        </header>

        {coverUrl && item.coverImage?.alt ? (
          <figure className="space-y-2">
            <Image
              src={coverUrl}
              alt={item.coverImage.alt}
              width={coverWidth}
              height={coverHeight}
              className="w-full rounded-xl border object-cover"
              placeholder={item.coverImage.asset?.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={item.coverImage.asset?.metadata?.lqip}
              priority
            />
            {item.coverImage.caption ? (
              <figcaption className="text-center text-sm text-muted-foreground">
                {item.coverImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <Separator />

        {item.body?.length ? (
          <PortableTextRenderer value={item.body} />
        ) : (
          <p className="text-sm text-muted-foreground">Контент пока не заполнен.</p>
        )}
      </article>
    </main>
  )
}
