"use client"

import * as React from "react"

import {
  Breadcrumb as BaseBreadcrumb,
  BreadcrumbEllipsis as BaseBreadcrumbEllipsis,
  BreadcrumbItem as BaseBreadcrumbItem,
  BreadcrumbLink as BaseBreadcrumbLink,
  BreadcrumbList as BaseBreadcrumbList,
  BreadcrumbPage as BaseBreadcrumbPage,
  BreadcrumbSeparator as BaseBreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

function Breadcrumb(props: React.ComponentProps<typeof BaseBreadcrumb>) {
  return <BaseBreadcrumb {...props} />
}

function BreadcrumbList(props: React.ComponentProps<typeof BaseBreadcrumbList>) {
  return <BaseBreadcrumbList {...props} />
}

function BreadcrumbItem(props: React.ComponentProps<typeof BaseBreadcrumbItem>) {
  return <BaseBreadcrumbItem {...props} />
}

function BreadcrumbLink({
  className,
  ...props
}: React.ComponentProps<typeof BaseBreadcrumbLink>) {
  return (
    <BaseBreadcrumbLink
      className={cn("cursor-pointer", className)}
      {...props}
    />
  )
}

function BreadcrumbPage(props: React.ComponentProps<typeof BaseBreadcrumbPage>) {
  return <BaseBreadcrumbPage {...props} />
}

function BreadcrumbSeparator(
  props: React.ComponentProps<typeof BaseBreadcrumbSeparator>
) {
  return <BaseBreadcrumbSeparator {...props} />
}

function BreadcrumbEllipsis(
  props: React.ComponentProps<typeof BaseBreadcrumbEllipsis>
) {
  return <BaseBreadcrumbEllipsis {...props} />
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
