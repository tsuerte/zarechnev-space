"use client"

import Image from "next/image"
import Link from "next/link"

import { formatPublishedDate } from "@/lib/date"
import type { CaseStudyListItem } from "@/lib/sanity/types"
import {
  AspectRatio,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui-kit"

type CasesBrowserProps = {
  caseStudies: CaseStudyListItem[]
}

export function CasesBrowser({ caseStudies }: CasesBrowserProps) {
  return (
    <>
      {caseStudies.length === 0 ? (
        <p className="text-sm text-muted-foreground">Опубликованных кейсов пока нет.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {caseStudies.map((item) => (
            <li key={item._id} className="h-full">
              <Card
                className={`h-full ${item.coverImage?.asset?.url && item.coverImage?.alt ? "pt-0" : ""}`}
              >
                {item.coverImage?.asset?.url && item.coverImage?.alt ? (
                  <AspectRatio
                    ratio={
                      (item.coverImage.asset.metadata?.dimensions?.width ?? 1200) /
                      (item.coverImage.asset.metadata?.dimensions?.height ?? 675)
                    }
                    className="rounded-t-xl border-b bg-muted"
                  >
                    <Image
                      src={item.coverImage.asset.url}
                      alt={item.coverImage.alt}
                      fill
                      className="h-full w-full object-cover"
                      placeholder={item.coverImage.asset.metadata?.lqip ? "blur" : "empty"}
                      blurDataURL={item.coverImage.asset.metadata?.lqip}
                      sizes="(min-width: 1536px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </AspectRatio>
                ) : null}

                <CardHeader className="gap-1.5">
                  <CardTitle className="text-xl">
                    {item.slug ? (
                      <Link href={`/cases/${item.slug}`} className="hover:underline">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </CardTitle>

                  {item.excerpt ? (
                    <CardDescription className="text-sm leading-relaxed text-pretty">
                      {item.excerpt}
                    </CardDescription>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-2.5">
                  <p className="text-sm text-muted-foreground">
                    {formatPublishedDate(item.publishedAt)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
