"use client"

import * as React from "react"

import { Switch as BaseSwitch } from "@/components/ui/switch"

function Switch({
  ...props
}: React.ComponentProps<typeof BaseSwitch>) {
  return <BaseSwitch {...props} />
}

export { Switch }
