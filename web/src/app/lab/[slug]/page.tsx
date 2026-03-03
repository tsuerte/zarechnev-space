import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ZalivatorSidebar } from "@/components/zalivator-sidebar"
import { buildMetadata } from "@/lib/seo"

const ZALIVATOR_SLUG = "zalivator"

type PageParams = {
  slug: string
}

function humanizeSlug(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ")
}

export function generateStaticParams() {
  return [{ slug: ZALIVATOR_SLUG }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params

  if (slug !== ZALIVATOR_SLUG) {
    return buildMetadata({
      title: humanizeSlug(slug),
      description: "Страница проекта.",
      path: `/lab/${slug}`,
      noindex: true,
    })
  }

  return buildMetadata({
    title: "Zalivator",
    description: "Генератор мок-данных для РФ.",
    path: `/lab/${slug}`,
    type: "article",
  })
}

export default async function LabProjectPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { slug } = await params

  if (slug !== ZALIVATOR_SLUG) {
    notFound()
  }

  return (
    <main className="h-full min-h-0 w-full">
      <div className="flex h-full min-h-0">
        <ZalivatorSidebar />

        <section className="min-w-0 flex-1 p-6">
          <p className="text-sm text-muted-foreground">Скоро здесь что-то появится.</p>
        </section>
      </div>
    </main>
  )
}
