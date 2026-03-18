import { FileText } from "lucide-react"
import { unstable_cache } from "next/cache"
import Link from "next/link"

import { formatPublishedDate } from "@/lib/date"
import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { designOpsListQuery } from "@/lib/sanity/queries"
import type { CaseStudyListItem } from "@/lib/sanity/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui-kit"

export const metadata = buildMetadata({
  title: "DesignOps",
  description: "Материалы по DesignOps.",
  path: "/designops",
})

export const revalidate = 300

const getDesignOpsCached = unstable_cache(
  async () => sanityClient.fetch<CaseStudyListItem[]>(designOpsListQuery),
  ["designops-list"],
  { revalidate: 300 }
)

async function getDesignOps(): Promise<CaseStudyListItem[]> {
  return getDesignOpsCached()
}

export default async function DesignOpsPage() {
  const items = await getDesignOps()

  return (
    <main className="mx-auto w-full max-w-4xl">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">DesignOps</h1>
        <p className="text-base text-muted-foreground">
          Раздел с материалами по DesignOps.
        </p>
      </section>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Материалы для этого раздела пока не опубликованы.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item._id} className="h-full">
              <Card className="h-full">
                <CardHeader className="gap-2">
                  <CardTitle className="text-xl">
                    {item.slug ? (
                      <Link href={`/designops/${item.slug}`} className="hover:underline">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                          <span>{item.title}</span>
                        </span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span>{item.title}</span>
                      </span>
                    )}
                  </CardTitle>
                  {item.excerpt ? (
                    <CardDescription className="text-sm leading-relaxed text-pretty">
                      {item.excerpt}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {formatPublishedDate(item.publishedAt)}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
