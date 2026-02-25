import type { Metadata } from "next"

export const SITE_BRAND = "Андрей Заречнев - Product Designer"
export const SITE_DEFAULT_TITLE = "Андрей Заречнев - Product Designer"
export const SITE_DESCRIPTION = "Усиливаю системную роль дизайна в продукте"
export const DEFAULT_OG_IMAGE_PATH = "/og/default.png"

function resolveSiteUrl() {
  const fallback = "https://zarechnev.space"
  const rawValue = (process.env.NEXT_PUBLIC_SITE_URL ?? fallback).trim()
  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`

  try {
    return new URL(withProtocol).origin
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SITE_URL="${rawValue}". Use domain with protocol, e.g. https://zarechnev.space`
    )
  }
}

export const SITE_URL = resolveSiteUrl()

export function absoluteUrl(path: string = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${SITE_URL}/`).toString()
}

type BuildMetadataInput = {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
  type?: "website" | "article"
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE_PATH,
  noindex = false,
  type = "website",
}: BuildMetadataInput = {}): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  const socialTitle = title ?? SITE_DEFAULT_TITLE

  const metadata: Metadata = {
    description,
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      type,
      locale: "ru_RU",
      siteName: SITE_BRAND,
      url: canonical,
      title: socialTitle,
      description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  }

  if (title) {
    metadata.title = title
  }

  return metadata
}
