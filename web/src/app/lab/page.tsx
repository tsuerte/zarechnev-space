import Link from "next/link"

import { buildMetadata } from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui-kit"

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
        <p className="text-muted-foreground text-base">
          Раздел для отдельных проектов и экспериментов.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Link href="/lab/zalivator" className="hover:underline">
                Zalivator
              </Link>
            </CardTitle>
            <CardDescription>Генератор мок-данных для макетов и прототипов.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            В разработке.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
