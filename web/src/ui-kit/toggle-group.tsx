"use client"

import * as React from "react"

import {
  ToggleGroup as BaseToggleGroup,
  ToggleGroupItem as BaseToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof BaseToggleGroup>) {
  return (
    <BaseToggleGroup
      className={cn("rounded-[var(--radius-md)]", className)}
      {...props}
    />
  )
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseToggleGroupItem>) {
  return (
    <BaseToggleGroupItem
      className={cn(
        "rounded-[var(--radius-md)] group-data-[spacing=0]/toggle-group:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-[var(--radius-md)] group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-[var(--radius-md)] group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-[var(--radius-md)] group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-[var(--radius-md)] font-normal cursor-pointer disabled:cursor-default",
        className
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
