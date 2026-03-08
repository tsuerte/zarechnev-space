"use client"

import * as React from "react"

import { Input as BaseInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  React.ElementRef<typeof BaseInput>,
  React.ComponentProps<typeof BaseInput>
>(({ className, ...props }, ref) => {
  return <BaseInput ref={ref} className={cn("file:font-normal", className)} {...props} />
})

Input.displayName = "Input"

export { Input }
