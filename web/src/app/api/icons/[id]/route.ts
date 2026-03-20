import { NextResponse } from "next/server"

import { getPublicIconFamily } from "@/lib/icons/storage"
import type { IconFamilyDetail } from "@/lib/icons/types"

type IconDetailRouteResponse = {
  icon: IconFamilyDetail | null
  error: string | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const icon = await getPublicIconFamily(id)

  const payload: IconDetailRouteResponse = icon
    ? {
        icon,
        error: null,
      }
    : {
        icon: null,
        error: "Иконка не найдена.",
      }

  return NextResponse.json(payload, { status: icon ? 200 : 404 })
}
