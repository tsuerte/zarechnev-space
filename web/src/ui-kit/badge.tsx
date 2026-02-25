"use client"

import * as React from "react"

import {
  Badge as BaseBadge,
  badgeVariants as baseBadgeVariants,
} from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function Badge({
  className,
  ...props
}: React.ComponentProps<typeof BaseBadge>) {
  return <BaseBadge className={cn("font-normal", className)} {...props} />
}

function badgeVariants(
  ...args: Parameters<typeof baseBadgeVariants>
) {
  return cn(baseBadgeVariants(...args), "font-normal")
}

export { Badge, badgeVariants }
