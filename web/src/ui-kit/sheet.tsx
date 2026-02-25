"use client"

import * as React from "react"

import {
  Sheet as BaseSheet,
  SheetClose as BaseSheetClose,
  SheetContent as BaseSheetContent,
  SheetDescription as BaseSheetDescription,
  SheetFooter as BaseSheetFooter,
  SheetHeader as BaseSheetHeader,
  SheetTitle as BaseSheetTitle,
  SheetTrigger as BaseSheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function Sheet(props: React.ComponentProps<typeof BaseSheet>) {
  return <BaseSheet {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof BaseSheetTrigger>) {
  return <BaseSheetTrigger {...props} />
}

function SheetClose(props: React.ComponentProps<typeof BaseSheetClose>) {
  return <BaseSheetClose {...props} />
}

function SheetContent(props: React.ComponentProps<typeof BaseSheetContent>) {
  return <BaseSheetContent {...props} />
}

function SheetHeader(props: React.ComponentProps<typeof BaseSheetHeader>) {
  return <BaseSheetHeader {...props} />
}

function SheetFooter(props: React.ComponentProps<typeof BaseSheetFooter>) {
  return <BaseSheetFooter {...props} />
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheetTitle>) {
  return <BaseSheetTitle className={cn("font-normal", className)} {...props} />
}

function SheetDescription(props: React.ComponentProps<typeof BaseSheetDescription>) {
  return <BaseSheetDescription {...props} />
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
