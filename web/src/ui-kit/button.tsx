"use client"

import * as React from "react"

import {
  Button as BaseButton,
  buttonVariants as baseButtonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Button({
  className,
  ...props
}: React.ComponentProps<typeof BaseButton>) {
  return <BaseButton className={cn("font-normal", className)} {...props} />
}

function buttonVariants(
  ...args: Parameters<typeof baseButtonVariants>
) {
  return cn(baseButtonVariants(...args), "font-normal")
}

export { Button, buttonVariants }
