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
              <Link href="/lab/avatars" className="hover:underline">
                Аватары
              </Link>
            </CardTitle>
            <CardDescription>Каталог и подборка аватаров из Sanity.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Просмотр, фильтрация и ZIP-скачивание наборов аватаров.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Link href="/lab/icons" className="hover:underline">
                Icons
              </Link>
            </CardTitle>
            <CardDescription>Каталог SVG-иконок для интерфейсов.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            UI-shell каталога с постоянной detail-panel.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Link href="/lab/svg" className="hover:underline">
                SVG Optimizer
              </Link>
            </CardTitle>
            <CardDescription>Инструмент для очистки и сжатия SVG.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Загрузите файл или вставьте SVG из буфера.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Link href="/lab/zalivator" className="hover:underline">
                Zalivator
              </Link>
            </CardTitle>
            <CardDescription>Генератор текстовых мок-данных для плагина.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Стартовый `v1` для имени, мобильного телефона и email.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
