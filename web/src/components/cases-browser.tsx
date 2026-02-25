"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { formatPublishedDate } from "@/lib/date"
import type { CaseCategory, CaseStudyListItem } from "@/lib/sanity/types"
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/ui-kit"

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = normalizeCategoryParam(searchParams.get("category"))
  const activeFilterValue = activeCategory ?? "all"

  const filteredCaseStudies = useMemo(() => {
    if (!activeCategory) return caseStudies

    return caseStudies.filter((item) =>
      item.categories?.some((category) => category.slug === activeCategory)
    )
  }, [activeCategory, caseStudies])

  const filterItems = useMemo(
    () => categories.filter((item) => item.slug),
    [categories]
  )

  function handleCategoryChange(nextValue: string) {
    const nextParams = new URLSearchParams(searchParams.toString())

    if (nextValue === "all") {
      nextParams.delete("category")
    } else {
      nextParams.set("category", nextValue)
    }

    const query = nextParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <>
      <section className="mb-5">
        <Tabs value={activeFilterValue} onValueChange={handleCategoryChange}>
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>

            {filterItems.map((item) => (
              <TabsTrigger key={item.slug} value={item.slug || ""}>
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      {filteredCaseStudies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Для этой категории пока нет опубликованных кейсов.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredCaseStudies.map((item) => (
            <li key={item._id} className="h-full">
              <Card className="h-full">
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
