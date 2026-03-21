"use client"

import * as React from "react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel as UIFieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle as UIFieldTitle,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof UIFieldLabel>) {
  return <UIFieldLabel className={cn("leading-5", className)} {...props} />
}

function FieldTitle({
  className,
  ...props
}: React.ComponentProps<typeof UIFieldTitle>) {
  return <UIFieldTitle className={cn("leading-5", className)} {...props} />
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
