"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { downloadAvatarsZip } from "@/lib/avatars/client"
import type {
  AvatarGender,
  AvatarKind,
  AvatarListItem,
  AvatarSourceType,
} from "@/lib/sanity/types"
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"

type AvatarsBrowserProps = {
  items: AvatarListItem[]
}

type KindFilter = "all" | AvatarKind
type GenderFilter = "all" | AvatarGender
type SourceFilter = "all" | AvatarSourceType
type PreviewMode = "rounded" | "square" | "circle"

const previewModeClassName: Record<PreviewMode, string> = {
  rounded: "rounded-2xl",
  square: "rounded-none",
  circle: "rounded-full",
}

export function AvatarsBrowser({ items }: AvatarsBrowserProps) {
  const [kind, setKind] = useState<KindFilter>("all")
  const [gender, setGender] = useState<GenderFilter>("all")
  const [sourceType, setSourceType] = useState<SourceFilter>("all")
  const [previewMode, setPreviewMode] = useState<PreviewMode>("rounded")
  const [isZipLoading, setIsZipLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) {
        return false
      }

      if (kind === "human" && gender !== "all" && item.gender !== gender) {
        return false
      }

      if (sourceType !== "all" && item.sourceType !== sourceType) {
        return false
      }

      return true
    })
  }, [items, kind, gender, sourceType])

  async function handleZipDownload() {
    try {
      setIsZipLoading(true)
      const result = await downloadAvatarsZip(filtered)
      setFeedback(`Скачан ZIP: ${result.count} шт.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Не удалось скачать ZIP.")
    } finally {
      setIsZipLoading(false)
    }
  }

  return (
    <section className="w-full space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Avatars</h1>
        <p className="text-muted-foreground text-base">
          Библиотека аватаров из Sanity с базовой фильтрацией.
        </p>
      </header>

      <section>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            size="md"
            value={sourceType}
            onValueChange={(value) => setSourceType(value as SourceFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">Источник: любой</TabsTrigger>
              <TabsTrigger value="self">Сам</TabsTrigger>
              <TabsTrigger value="freepik_ai">Freepik</TabsTrigger>
              <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs size="md" value={kind} onValueChange={(value) => setKind(value as KindFilter)}>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="human">Человек</TabsTrigger>
              <TabsTrigger value="object">Объект</TabsTrigger>
            </TabsList>
          </Tabs>

          {kind === "human" ? (
            <Tabs
              size="md"
              value={gender}
              onValueChange={(value) => setGender(value as GenderFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">Пол: любой</TabsTrigger>
                <TabsTrigger value="male">М</TabsTrigger>
                <TabsTrigger value="female">Ж</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup
              type="single"
              variant="outline"
              value={previewMode}
              onValueChange={(value) => {
                if (value === "rounded" || value === "square" || value === "circle") {
                  setPreviewMode(value)
                }
              }}
              aria-label="Use case preview"
            >
              <ToggleGroupItem value="rounded" aria-label="Скругленные углы">
                Скругленные
              </ToggleGroupItem>
              <ToggleGroupItem value="square" aria-label="Прямоугольник">
                Квадратные
              </ToggleGroupItem>
              <ToggleGroupItem value="circle" aria-label="Круг">
                Круглые
              </ToggleGroupItem>
            </ToggleGroup>

            <Button type="button" variant="outline" onClick={handleZipDownload} disabled={isZipLoading}>
              <Download className="size-4" />
              {isZipLoading ? "Собираем ZIP..." : "Скачать ZIP"}
            </Button>
          </div>
        </div>

        {feedback ? <p className="mt-3 text-sm text-muted-foreground">{feedback}</p> : null}
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          По текущим фильтрам ничего не найдено.
        </p>
      ) : (
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(148px,1fr))]">
          {filtered.map((item) => {
            const imageUrl = item.image?.asset?.url

            return (
              <li key={item._id} className="w-full">
                <div className="relative block w-full">
                  <div
                    className={[
                      "relative aspect-square w-full overflow-hidden",
                      previewModeClassName[previewMode],
                    ].join(" ")}
                  >
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={item.alt}
                          fill
                          className="object-cover"
                          placeholder={item.image?.asset?.metadata?.lqip ? "blur" : "empty"}
                          blurDataURL={item.image?.asset?.metadata?.lqip}
                          sizes="(max-width: 639px) 45vw, 180px"
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        Нет изображения
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
