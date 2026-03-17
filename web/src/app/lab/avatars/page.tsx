import { unstable_cache } from "next/cache"

import { AvatarsBrowser } from "@/components/avatars-browser"
import { buildMetadata } from "@/lib/seo"
import { sanityClient } from "@/lib/sanity/client"
import { avatarsListQuery } from "@/lib/sanity/queries"
import type { AvatarListItem } from "@/lib/sanity/types"

export const metadata = buildMetadata({
  title: "Avatars",
  description: "Библиотека аватаров с фильтрами по источнику и полу.",
  path: "/lab/avatars",
})

export const revalidate = 300

const getAvatars = unstable_cache(
  async () => sanityClient.fetch<AvatarListItem[]>(avatarsListQuery),
  ["lab-avatars"],
  { revalidate: 300 }
)

export default async function AvatarsPage() {
  const items = await getAvatars()

  return (
    <main className="w-full">
      <AvatarsBrowser items={items} />
    </main>
  )
}
