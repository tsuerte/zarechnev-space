"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { downloadAvatarsZip } from "@/lib/avatars/client"
import type {
  AvatarGender,
  AvatarListItem,
  AvatarSourceType,
} from "@/lib/sanity/types"
import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
} from "@/ui-kit"

type AvatarsBrowserProps = {
  items: AvatarListItem[]
}

type GenderFilter = "all" | AvatarGender
type SourceFilter = "all" | AvatarSourceType

export function AvatarsBrowser({ items }: AvatarsBrowserProps) {
  const [gender, setGender] = useState<GenderFilter>("all")
  const [sourceType, setSourceType] = useState<SourceFilter>("all")
  const [isZipLoading, setIsZipLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (gender !== "all" && item.gender !== gender) {
        return false
      }

      if (sourceType !== "all" && item.sourceType !== sourceType) {
        return false
      }

      return true
    })
  }, [items, gender, sourceType])

  async function handleZipDownload() {
    try {
      setFeedback(null)
      setIsZipLoading(true)
      await downloadAvatarsZip(items)
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
          <ToggleGroup
            type="single"
            variant="outline"
            value={sourceType}
            onValueChange={(value) => {
              if (value === "all" || value === "freepik_ai" || value === "unsplash") {
                setSourceType(value)
              }
            }}
            aria-label="Фильтр по источнику"
          >
            <ToggleGroupItem value="all" aria-label="Все источники">
              Все
            </ToggleGroupItem>
            <ToggleGroupItem value="freepik_ai" aria-label="Freepik">
              Freepik
            </ToggleGroupItem>
            <ToggleGroupItem value="unsplash" aria-label="Unsplash">
              Unsplash
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            variant="outline"
            value={gender}
            onValueChange={(value) => {
              if (value === "all" || value === "male" || value === "female") {
                setGender(value)
              }
            }}
            aria-label="Фильтр по полу"
          >
            <ToggleGroupItem value="all" aria-label="Все">
              Все
            </ToggleGroupItem>
            <ToggleGroupItem value="male" aria-label="Мужской">
              Муж
            </ToggleGroupItem>
            <ToggleGroupItem value="female" aria-label="Женский">
              Жен
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="ml-auto flex items-center gap-2">
            <Button type="button" onClick={handleZipDownload} disabled={isZipLoading}>
              <Download className="size-4" />
              {isZipLoading ? "Собираем ZIP..." : "Скачать всё в ZIP"}
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
                    className="relative aspect-square w-full overflow-hidden rounded-full"
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
