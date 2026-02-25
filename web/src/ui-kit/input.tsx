"use client"

import * as React from "react"

import { Input as BaseInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Input({
  className,
  ...props
}: React.ComponentProps<typeof BaseInput>) {
  return <BaseInput className={cn("file:font-normal", className)} {...props} />
}

export { Input }
