"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import type {
  AvatarGender,
  AvatarKind,
  AvatarListItem,
  AvatarSourceType,
} from "@/lib/sanity/types"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/ui-kit"

type AvatarsBrowserProps = {
  items: AvatarListItem[]
}

type KindFilter = "all" | AvatarKind
type GenderFilter = "all" | AvatarGender
type SourceFilter = "all" | AvatarSourceType

const sourceLabel: Record<AvatarSourceType, string> = {
  self: "Сам",
  freepik_ai: "Freepik",
  unsplash: "Unsplash",
}

const genderLabel: Record<AvatarGender, string> = {
  male: "М",
  female: "Ж",
}

export function AvatarsBrowser({ items }: AvatarsBrowserProps) {
  const [kind, setKind] = useState<KindFilter>("all")
  const [gender, setGender] = useState<GenderFilter>("all")
  const [sourceType, setSourceType] = useState<SourceFilter>("all")

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
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          По текущим фильтрам ничего не найдено.
        </p>
      ) : (
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
          {filtered.map((item) => {
            const imageUrl = item.image?.asset?.url
            const source = sourceLabel[item.sourceType]

            return (
              <li key={item._id} className="w-full">
                <Card className="h-full max-w-[200px] overflow-hidden pt-0">
                  <div className="bg-muted relative aspect-square w-full">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.alt}
                        fill
                        className="object-cover"
                        placeholder={item.image?.asset?.metadata?.lqip ? "blur" : "empty"}
                        blurDataURL={item.image?.asset?.metadata?.lqip}
                        sizes="(max-width: 639px) 45vw, 200px"
                      />
                    ) : null}
                  </div>
                  <CardHeader className="space-y-1.5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.kind === "human" ? "Человек" : "Объект"}</Badge>
                      {item.kind === "human" && item.gender ? (
                        <Badge variant="outline">{genderLabel[item.gender]}</Badge>
                      ) : null}
                      <Badge variant="outline">{source}</Badge>
                    </div>
                  </CardHeader>
                  {item.sourceType === "unsplash" && item.sourceUrl ? (
                    <CardContent>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline underline-offset-4"
                      >
                        Источник (Unsplash)
                      </a>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
