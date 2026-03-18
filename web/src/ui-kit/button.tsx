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
  return (
    <BaseButton
      className={cn(
        "font-normal rounded-[var(--radius-md)] cursor-pointer data-[variant=default]:hover:bg-primary/80 disabled:cursor-default",
        className
      )}
      {...props}
    />
  )
}

function buttonVariants(
  ...args: Parameters<typeof baseButtonVariants>
) {
  return cn(
    baseButtonVariants(...args),
    "font-normal rounded-[var(--radius-md)] cursor-pointer data-[variant=default]:hover:bg-primary/80 disabled:cursor-default"
  )
}

export { Button, buttonVariants }
