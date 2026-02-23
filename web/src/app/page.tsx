import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Badge, Button } from "@/ui-kit"

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center py-6 md:py-8">
      <section className="w-full max-w-3xl space-y-5">
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
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
