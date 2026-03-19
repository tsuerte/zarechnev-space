"use client"

import * as React from "react"

import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof BaseCheckbox>) {
  return <BaseCheckbox className={cn("cursor-pointer", className)} {...props} />
}

export { Checkbox }
