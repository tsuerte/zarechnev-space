import Image from "next/image"
import Link from "next/link"

import { buildMetadata } from "@/lib/seo"
import { Card, CardDescription, CardTitle } from "@/ui-kit"

const tools = [
  {
    href: "/lab/avatars",
    title: "Аватары",
    description: "Каталог и подборка аватаров из Sanity.",
    planetSrc: "/images/planet-pink.optimized.svg",
    planetAlt: "",
  },
  {
    href: "/lab/icons",
    title: "Icons",
    description: "Экспорт из Figma, оптимизация и готовый результат на фронте.",
    planetSrc: "/images/planet-blue.optimized.svg",
    planetAlt: "",
  },
  {
    href: "/lab/svg",
    title: "SVG Optimizer",
    description: "Инструмент для очистки и сжатия SVG.",
    planetSrc: "/images/planet-orange.optimized.svg",
    planetAlt: "",
  },
  {
    href: "/lab/zalivator",
    title: "Zalivator",
    description: "Генератор текстовых мок-данных для плагина.",
    planetSrc: "/images/planet-green.optimized.svg",
    planetAlt: "",
  },
] as const

export const metadata = buildMetadata({
  title: "Мастерская",
  description: "Экспериментальные и продуктовые проекты.",
  path: "/lab",
})

export default function LabPage() {
  return (
    <main className="mx-auto w-full max-w-5xl">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Мастерская</h1>
        <p className="text-base text-muted-foreground">
          Раздел для отдельных проектов и экспериментов.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block">
            <Card
              size="sm"
              className="transition-transform transition-colors duration-300 ease-out group-hover:-translate-y-1 group-hover:border-foreground/20 group-focus-visible:-translate-y-1 group-focus-visible:border-ring group-focus-visible:ring-ring/30 group-focus-visible:ring-2"
            >
              <div className="flex flex-col gap-3 px-5 py-1">
                <Image
                  src={tool.planetSrc}
                  alt={tool.planetAlt}
                  width={56}
                  height={56}
                  aria-hidden="true"
                  className="h-14 w-14 select-none"
                />
                <div className="space-y-1">
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  )
}
