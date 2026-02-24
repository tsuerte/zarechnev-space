import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { caseStudySitemapQuery } from "@/lib/sanity/queries"
import type { CaseStudySitemapItem } from "@/lib/sanity/types"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseStudies = await sanityClient.fetch<CaseStudySitemapItem[]>(caseStudySitemapQuery)
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/cases`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const caseRoutes: MetadataRoute.Sitemap = caseStudies.map((item) => ({
    url: `${SITE_URL}/cases/${item.slug}`,
    lastModified: item._updatedAt ? new Date(item._updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...caseRoutes]
}

