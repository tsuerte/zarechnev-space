"use client"

import * as React from "react"

import {
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCaption as BaseTableCaption,
  TableCell as BaseTableCell,
  TableHead as BaseTableHead,
  TableHeader as BaseTableHeader,
  TableRow as BaseTableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function Table(props: React.ComponentProps<typeof BaseTable>) {
  return <BaseTable {...props} />
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<typeof BaseTableHeader>) {
  return <BaseTableHeader className={cn("font-normal", className)} {...props} />
}

function TableBody(props: React.ComponentProps<typeof BaseTableBody>) {
  return <BaseTableBody {...props} />
}

function TableRow(props: React.ComponentProps<typeof BaseTableRow>) {
  return <BaseTableRow {...props} />
}

function TableHead({
  className,
  ...props
}: React.ComponentProps<typeof BaseTableHead>) {
  return <BaseTableHead className={cn("font-normal", className)} {...props} />
}

function TableCell(props: React.ComponentProps<typeof BaseTableCell>) {
  return <BaseTableCell {...props} />
}

function TableCaption(props: React.ComponentProps<typeof BaseTableCaption>) {
  return <BaseTableCaption {...props} />
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
}
