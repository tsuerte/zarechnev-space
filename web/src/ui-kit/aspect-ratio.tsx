"use client"

import * as React from "react"

import { AspectRatio as BaseAspectRatio } from "@/components/ui/aspect-ratio"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof BaseAspectRatio>) {
  return <BaseAspectRatio {...props} />
}

export { AspectRatio }
