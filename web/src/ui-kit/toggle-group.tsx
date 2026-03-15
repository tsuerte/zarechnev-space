"use client"

import * as React from "react"

import {
  ToggleGroup as BaseToggleGroup,
  ToggleGroupItem as BaseToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

function ToggleGroup({
  ...props
}: React.ComponentProps<typeof BaseToggleGroup>) {
  return <BaseToggleGroup {...props} />
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseToggleGroupItem>) {
  return (
    <BaseToggleGroupItem
      className={cn("font-normal", className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
