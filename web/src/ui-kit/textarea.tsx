"use client"

import * as React from "react"

import { Textarea as BaseTextarea } from "@/components/ui/textarea"

function Textarea(props: React.ComponentProps<typeof BaseTextarea>) {
  return <BaseTextarea {...props} />
}

export { Textarea }
