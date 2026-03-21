"use client"

import * as React from "react"

import { Label as UILabel } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof UILabel>) {
  return <UILabel className={cn("leading-5", className)} {...props} />
}

export { Label }
