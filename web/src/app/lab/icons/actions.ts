"use server"

import type { IconFamilyDetail } from "@/lib/icons/types"
import { getPublicIconFamily } from "@/lib/icons/storage"

export async function loadIconDetailAction(id: string): Promise<{
  icon: IconFamilyDetail | null
  error: string | null
}> {
  const icon = await getPublicIconFamily(id)

  if (!icon) {
    return {
      icon: null,
      error: "Иконка не найдена.",
    }
  }

  return {
    icon,
    error: null,
  }
}
