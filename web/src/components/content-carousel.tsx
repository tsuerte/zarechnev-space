"use client"

import * as React from "react"
import Image from "next/image"

import type { CarouselApi } from "@/ui-kit"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/ui-kit"
import { getEditorialImageDisplayDimensions } from "@/lib/editorial-image"

type ContentImageValue = {
  _key?: string
  _type?: "contentImage"
  alt: string
  caption?: string
  asset?: {
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width?: number
        height?: number
      }
    }
  }
}

type ContentCarouselValue = {
  title?: string
  description?: string
  items?: Array<{
    _key?: string
    image?: ContentImageValue
  }>
}

function getVisibleSlides() {
  if (typeof window === "undefined") return 1
  return window.matchMedia("(min-width: 768px)").matches ? 2 : 1
}

export function ContentCarousel({ value }: { value: ContentCarouselValue }) {
  const items = (value.items ?? []).filter(
    (item): item is { _key?: string; image: ContentImageValue } =>
      Boolean(item.image?.asset?.url && item.image.alt)
  )
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [visibleSlides, setVisibleSlides] = React.useState(1)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const updateVisibleSlides = () => {
      setVisibleSlides(getVisibleSlides())
    }

    updateVisibleSlides()
    mediaQuery.addEventListener("change", updateVisibleSlides)

    return () => {
      mediaQuery.removeEventListener("change", updateVisibleSlides)
    }
  }, [])

  React.useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    handleSelect()
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)

    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  if (items.length < 2) return null

  const start = selectedIndex + 1
  const end = Math.min(selectedIndex + visibleSlides, items.length)
  const counter = start === end ? `${start} из ${items.length}` : `${start}–${end} из ${items.length}`

  return (
    <section className="my-7 space-y-4">
      {value.title || value.description ? (
        <header className="space-y-2">
          {value.title ? (
            <h3 className="text-xl leading-6 font-medium tracking-tight">{value.title}</h3>
          ) : null}
          {value.description ? (
            <p className="text-base leading-7 text-muted-foreground">{value.description}</p>
          ) : null}
        </header>
      ) : null}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
        }}
        className="mx-auto w-full max-w-5xl"
      >
        <CarouselContent className="-ml-4">
          {items.map((item, index) => {
            const image = item.image
            const imageUrl = image.asset?.url
            const assetWidth = image.asset?.metadata?.dimensions?.width ?? 1200
            const assetHeight = image.asset?.metadata?.dimensions?.height ?? 675
            const { displayWidth: width, displayHeight: height } =
              getEditorialImageDisplayDimensions(assetWidth, assetHeight)

            if (!imageUrl) return null

            return (
              <CarouselItem
                key={item._key ?? `${imageUrl}-${index}`}
                className="pl-4 md:basis-1/2"
              >
                <Image
                  src={imageUrl}
                  alt={image.alt}
                  width={width}
                  height={height}
                  className="block h-auto w-full"
                  placeholder={image.asset?.metadata?.lqip ? "blur" : "empty"}
                  blurDataURL={image.asset?.metadata?.lqip}
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
      <p className="text-center text-sm text-muted-foreground">{counter}</p>
    </section>
  )
}
