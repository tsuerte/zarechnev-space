import Image from "next/image"
import { Mail, Send } from "lucide-react"
import Link from "next/link"

import { buildMetadata } from "@/lib/seo"
import { Button } from "@/ui-kit"

export const metadata = buildMetadata({
  path: "/",
})

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-start py-8 md:py-10">
      <section className="grid w-full items-start gap-8 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative mx-auto hidden w-full max-w-[200px] md:block">
          <Image
            src="/images/me 1.png"
            alt="Андрей Заречнев"
            width={200}
            height={512}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="mt-9 max-w-4xl space-y-8">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Андрей Заречнев
          </h1>

          <div className="space-y-1.5 text-2xl leading-tight tracking-tight sm:text-3xl">
            <p>Проектирую интерфейсы</p>
            <p>и развиваю дизайн как инструмент роста продукта</p>
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

          <Button asChild size="lg">
            <Link href="/lab">Открыть мастерскую</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
