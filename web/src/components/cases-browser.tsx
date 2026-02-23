"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { formatPublishedDate } from "@/lib/date"
import type { CaseCategory, CaseStudyListItem } from "@/lib/sanity/types"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui-kit"

type CasesBrowserProps = {
  caseStudies: CaseStudyListItem[]
  categories: CaseCategory[]
}

function normalizeCategoryParam(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  return value.length > 0 ? value : null
}

export function CasesBrowser({ caseStudies, categories }: CasesBrowserProps) {
  const searchParams = useSearchParams()
  const activeCategory = normalizeCategoryParam(searchParams.get("category"))

  const filteredCaseStudies = useMemo(() => {
    if (!activeCategory) return caseStudies

    return caseStudies.filter((item) =>
      item.categories?.some((category) => category.slug === activeCategory)
    )
  }, [activeCategory, caseStudies])

  return (
    <>
      <section className="mb-5 flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          variant={activeCategory ? "outline" : "default"}
          className="rounded-full"
        >
          <Link href="/cases">Все</Link>
        </Button>

        {categories
          .filter((item) => item.slug)
          .map((item) => (
            <Button
              key={item.slug}
              asChild
              size="sm"
              variant={activeCategory === item.slug ? "default" : "outline"}
              className="rounded-full"
            >
              <Link href={`/cases?category=${encodeURIComponent(item.slug || "")}`}>
                {item.title}
              </Link>
            </Button>
          ))}
      </section>

      {filteredCaseStudies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Для этой категории пока нет опубликованных кейсов.
        </p>
      ) : (
        <ul className="grid gap-5">
          {filteredCaseStudies.map((item) => (
            <li key={item._id}>
              <Card>
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

                  {item.categories?.length ? (
                    <div className="flex flex-wrap gap-2">
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
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
