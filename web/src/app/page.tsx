import Image from "next/image"
import { ChevronRight, Mail, Send } from "lucide-react"
import Link from "next/link"

import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { designOpsListQuery } from "@/lib/sanity/queries"
import type { CaseStudyListItem } from "@/lib/sanity/types"
import { Button, Separator } from "@/ui-kit"

export const metadata = buildMetadata({
  path: "/",
})

async function getDesignOpsItems() {
  try {
    return await sanityClient.fetch<CaseStudyListItem[]>(designOpsListQuery)
  } catch (error) {
    console.error("Failed to fetch designops items for homepage", error)
    return []
  }
}

const labFeatureCards = [
  {
    title: "Avatars",
    description: "Лица для аватарок",
    planetSrc: "/images/planet-1.svg",
    href: "/lab/avatars",
    gradient:
      "linear-gradient(120.35deg, #CE32D7 0%, #FF99C4 100%)",
    borderColor: "#FFC8F1",
  },
  {
    title: "Icons",
    description: "Экспортирует из артборда",
    planetSrc: "/images/planet-2.svg",
    href: "/lab/icons",
    gradient:
      "linear-gradient(120.35deg, #695EFF 0%, #5D16CC 100%)",
    borderColor: "#CDC8FF",
  },
  {
    title: "SVG Optimizer",
    description: "Очищает и сжимает вектор",
    planetSrc: "/images/planet-3.svg",
    href: "/lab/svg",
    gradient:
      "linear-gradient(120.35deg, #F2285B 0%, #FFC21F 100%)",
    borderColor: "#FFCC9E",
  },
  {
    title: "Zalivator",
    description: "Генерирует мок-данные",
    planetSrc: "/images/planet-4.svg",
    href: "/lab/zalivator",
    gradient:
      "linear-gradient(120.35deg, #1675DB 0%, #6BE339 100%)",
    borderColor: "#A2C7FF",
  },
] as const

export default async function HomePage() {
  const designOpsItems = await getDesignOpsItems()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-12 py-8 md:py-10">
      <section className="grid w-full items-start gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative mx-auto hidden w-full max-w-[200px] md:block">
          <Image
            src="/images/me-pack.png"
            alt="Андрей Заречнев"
            width={200}
            height={512}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="mt-9 max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Андрей Заречнев
            </h1>

            <div className="space-y-1.5 text-2xl leading-tight tracking-tight sm:text-3xl">
              <p>Проектирую интерфейсы</p>
              <p>и развиваю дизайн как инструмент роста продукта</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="lg">
              <a
                href="https://t.me/zrcnv"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Send aria-hidden="true" />
                <span>@zrcnv</span>
              </a>
            </Button>

            <Button asChild variant="outline" size="lg">
              <a href="mailto:andrei@zarechnev.space">
                <Mail aria-hidden="true" />
                <span>andrei@zarechnev.space</span>
              </a>
            </Button>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl leading-tight font-semibold tracking-tight">
                  Мастерская
                </h2>
                <p className="text-sm text-muted-foreground">
                  Небольшие рабочие инструменты и эксперименты.
                </p>
              </div>

              <div className="grid w-full gap-4 md:grid-cols-2">
                {labFeatureCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group"
                  >
                    <div
                      className="relative h-[120px] overflow-hidden rounded-xl border-[3px] px-6 py-5 text-white transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                      style={{
                        backgroundImage: card.gradient,
                        borderColor: card.borderColor,
                      }}
                    >
                      <div className="relative z-10 flex flex-col gap-1.5">
                        <h3 className="text-[20px] leading-6 font-medium">
                          {card.title}
                        </h3>
                        <p className="text-sm leading-[18px]">{card.description}</p>
                      </div>

                      <Image
                        src={card.planetSrc}
                        alt=""
                        width={140}
                        height={140}
                        className="pointer-events-none absolute right-[-24px] bottom-[-52px] h-auto w-[140px] max-w-none select-none"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-2xl leading-tight font-semibold tracking-tight">
                  DesignOps
                </h2>
                <p className="text-sm text-muted-foreground">
                  Записи про процессы, взаимодействие и зрелость дизайна.
                </p>
              </div>

            <div className="overflow-hidden rounded-xl border bg-card text-card-foreground">
              <div className="flex flex-col">
                {designOpsItems.map((item, index) => (
                  <div key={item._id}>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto w-full justify-between rounded-none px-6 py-4"
                    >
                      <Link href={`/designops/${item.slug}`}>
                        <div className="min-w-0 text-left">
                          <div className="truncate text-base font-medium">
                            {item.title}
                          </div>
                          {item.excerpt ? (
                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {item.excerpt}
                            </p>
                          ) : null}
                        </div>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      </Link>
                    </Button>
                    {index < designOpsItems.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
