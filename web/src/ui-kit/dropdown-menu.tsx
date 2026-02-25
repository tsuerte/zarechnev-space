"use client"

import * as React from "react"

import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuCheckboxItem as BaseDropdownMenuCheckboxItem,
  DropdownMenuContent as BaseDropdownMenuContent,
  DropdownMenuGroup as BaseDropdownMenuGroup,
  DropdownMenuItem as BaseDropdownMenuItem,
  DropdownMenuLabel as BaseDropdownMenuLabel,
  DropdownMenuPortal as BaseDropdownMenuPortal,
  DropdownMenuRadioGroup as BaseDropdownMenuRadioGroup,
  DropdownMenuRadioItem as BaseDropdownMenuRadioItem,
  DropdownMenuSeparator as BaseDropdownMenuSeparator,
  DropdownMenuShortcut as BaseDropdownMenuShortcut,
  DropdownMenuSub as BaseDropdownMenuSub,
  DropdownMenuSubContent as BaseDropdownMenuSubContent,
  DropdownMenuSubTrigger as BaseDropdownMenuSubTrigger,
  DropdownMenuTrigger as BaseDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function DropdownMenu(props: React.ComponentProps<typeof BaseDropdownMenu>) {
  return <BaseDropdownMenu {...props} />
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof BaseDropdownMenuTrigger>
) {
  return <BaseDropdownMenuTrigger {...props} />
}

function DropdownMenuContent(
  props: React.ComponentProps<typeof BaseDropdownMenuContent>
) {
  return <BaseDropdownMenuContent {...props} />
}

function DropdownMenuGroup(props: React.ComponentProps<typeof BaseDropdownMenuGroup>) {
  return <BaseDropdownMenuGroup {...props} />
}

function DropdownMenuItem(props: React.ComponentProps<typeof BaseDropdownMenuItem>) {
  return <BaseDropdownMenuItem {...props} />
}

function DropdownMenuCheckboxItem(
  props: React.ComponentProps<typeof BaseDropdownMenuCheckboxItem>
) {
  return <BaseDropdownMenuCheckboxItem {...props} />
}

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof BaseDropdownMenuRadioGroup>
) {
  return <BaseDropdownMenuRadioGroup {...props} />
}

function DropdownMenuRadioItem(
  props: React.ComponentProps<typeof BaseDropdownMenuRadioItem>
) {
  return <BaseDropdownMenuRadioItem {...props} />
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseDropdownMenuLabel>) {
  return <BaseDropdownMenuLabel className={cn("font-normal", className)} {...props} />
}

function DropdownMenuSeparator(
  props: React.ComponentProps<typeof BaseDropdownMenuSeparator>
) {
  return <BaseDropdownMenuSeparator {...props} />
}

function DropdownMenuShortcut(
  props: React.ComponentProps<typeof BaseDropdownMenuShortcut>
) {
  return <BaseDropdownMenuShortcut {...props} />
}

function DropdownMenuPortal(
  props: React.ComponentProps<typeof BaseDropdownMenuPortal>
) {
  return <BaseDropdownMenuPortal {...props} />
}

function DropdownMenuSub(props: React.ComponentProps<typeof BaseDropdownMenuSub>) {
  return <BaseDropdownMenuSub {...props} />
}

function DropdownMenuSubContent(
  props: React.ComponentProps<typeof BaseDropdownMenuSubContent>
) {
  return <BaseDropdownMenuSubContent {...props} />
}

function DropdownMenuSubTrigger(
  props: React.ComponentProps<typeof BaseDropdownMenuSubTrigger>
) {
  return <BaseDropdownMenuSubTrigger {...props} />
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
