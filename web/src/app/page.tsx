import { RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"

import { Badge, Button } from "@/ui-kit"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          Portfolio
        </Badge>

        <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Привет, я Андрей, продуктовый дизайнер.
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          Публикую кейсы про продуктовые решения, UX-стратегию и дизайн-системы.
        </p>

        <Button asChild size="lg">
          <Link href="/cases">
            Перейти в кейсы
            <RiArrowRightLine aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
