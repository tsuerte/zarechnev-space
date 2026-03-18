"use client"

import * as React from "react"

import { Slider as BaseSlider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof BaseSlider>) {
  return (
    <BaseSlider
      className={cn(
        "cursor-pointer disabled:cursor-default [&_[data-slot=slider-thumb]]:cursor-pointer [&_[data-slot=slider-thumb]]:disabled:cursor-default",
        className
      )}
      {...props}
    />
  )
}

export { Slider }
