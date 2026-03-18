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
  const { className, ...restProps } = props
  return (
    <BaseDropdownMenuItem
      className={cn("cursor-pointer data-disabled:cursor-default", className)}
      {...restProps}
    />
  )
}

function DropdownMenuCheckboxItem(
  props: React.ComponentProps<typeof BaseDropdownMenuCheckboxItem>
) {
  const { className, ...restProps } = props
  return (
    <BaseDropdownMenuCheckboxItem
      className={cn("cursor-pointer data-disabled:cursor-default", className)}
      {...restProps}
    />
  )
}

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof BaseDropdownMenuRadioGroup>
) {
  return <BaseDropdownMenuRadioGroup {...props} />
}

function DropdownMenuRadioItem(
  props: React.ComponentProps<typeof BaseDropdownMenuRadioItem>
) {
  const { className, ...restProps } = props
  return (
    <BaseDropdownMenuRadioItem
      className={cn("cursor-pointer data-disabled:cursor-default", className)}
      {...restProps}
    />
  )
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
  const { className, ...restProps } = props
  return (
    <BaseDropdownMenuSubTrigger
      className={cn("cursor-pointer data-disabled:cursor-default", className)}
      {...restProps}
    />
  )
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
