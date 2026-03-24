import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { PortableTextRenderer } from "@/components/portable-text"
import { formatPublishedDate } from "@/lib/date"
import { getEditorialImageDisplayDimensions } from "@/lib/editorial-image"
import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudyBySlugAndSectionQuery, designOpsSlugsQuery } from "@/lib/sanity/queries"
import type { CaseStudy } from "@/lib/sanity/types"
import { Separator } from "@/ui-kit"

type PageParams = {
  slug: string
}

type CaseStudySlug = {
  slug: string
}

export const revalidate = 300

async function getDesignOpsItem(slug: string): Promise<CaseStudy | null> {
  return sanityClient.fetch<CaseStudy | null>(caseStudyBySlugAndSectionQuery, {
    slug,
    section: "designops",
  })
}

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<CaseStudySlug[]>(designOpsSlugsQuery)
  return slugs.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getDesignOpsItem(slug)

  if (!item) {
    return buildMetadata({
      title: "Not found",
      path: `/designops/${slug}`,
      noindex: true,
    })
  }

  return buildMetadata({
    title: item.title,
    description: item.excerpt || item.title,
    path: `/designops/${item.slug ?? slug}`,
    image: item.coverImage?.asset?.url,
    type: "article",
  })
}

export default async function DesignOpsArticlePage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { slug } = await params
  const item = await getDesignOpsItem(slug)

  if (!item) {
    notFound()
  }

  const coverUrl = item.coverImage?.asset?.url
  const coverAssetWidth = item.coverImage?.asset?.metadata?.dimensions?.width ?? 1200
  const coverAssetHeight = item.coverImage?.asset?.metadata?.dimensions?.height ?? 675
  const { displayWidth: coverWidth, displayHeight: coverHeight } =
    getEditorialImageDisplayDimensions(coverAssetWidth, coverAssetHeight)

  return (
    <main className="mx-auto w-full max-w-4xl">
      <article className="space-y-7">
        <header className="space-y-3">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {item.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {formatPublishedDate(item.publishedAt)}
          </p>

          {item.excerpt ? (
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {item.excerpt}
            </p>
          ) : null}
        </header>

        {coverUrl && item.coverImage?.alt ? (
          <figure className="mx-auto w-full space-y-2" style={{ maxWidth: `${coverWidth}px` }}>
            <Image
              src={coverUrl}
              alt={item.coverImage.alt}
              width={coverWidth}
              height={coverHeight}
              className="w-full rounded-xl object-cover"
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
