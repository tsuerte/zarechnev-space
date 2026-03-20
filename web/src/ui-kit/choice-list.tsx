"use client"

import * as React from "react"

import {
  ChoiceList as BaseChoiceList,
  type ChoiceListOption,
} from "@/components/ui/choice-list"

function ChoiceList(props: React.ComponentProps<typeof BaseChoiceList>) {
  return <BaseChoiceList {...props} />
}

export { ChoiceList }
export type { ChoiceListOption }
