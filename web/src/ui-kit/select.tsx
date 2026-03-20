"use client"

import * as React from "react"

import {
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectGroup as BaseSelectGroup,
  SelectItem as BaseSelectItem,
  SelectLabel as BaseSelectLabel,
  SelectSeparator as BaseSelectSeparator,
  SelectTrigger as BaseSelectTrigger,
  SelectValue as BaseSelectValue,
} from "@/components/ui/select"

function Select(props: React.ComponentProps<typeof BaseSelect>) {
  return <BaseSelect {...props} />
}

function SelectContent(props: React.ComponentProps<typeof BaseSelectContent>) {
  return <BaseSelectContent {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof BaseSelectGroup>) {
  return <BaseSelectGroup {...props} />
}

function SelectItem(props: React.ComponentProps<typeof BaseSelectItem>) {
  return <BaseSelectItem {...props} />
}

function SelectLabel(props: React.ComponentProps<typeof BaseSelectLabel>) {
  return <BaseSelectLabel {...props} />
}

function SelectSeparator(props: React.ComponentProps<typeof BaseSelectSeparator>) {
  return <BaseSelectSeparator {...props} />
}

function SelectTrigger(props: React.ComponentProps<typeof BaseSelectTrigger>) {
  return <BaseSelectTrigger {...props} />
}

function SelectValue(props: React.ComponentProps<typeof BaseSelectValue>) {
  return <BaseSelectValue {...props} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
