"use client"

import * as React from "react"

import { Label as BaseLabel } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof BaseLabel>) {
  return <BaseLabel className={cn("font-normal", className)} {...props} />
}

export { Label }
