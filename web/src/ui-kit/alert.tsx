"use client"

import * as React from "react"

import {
  Alert as BaseAlert,
  AlertDescription as BaseAlertDescription,
  AlertTitle as BaseAlertTitle,
} from "@/components/ui/alert"
import { cn } from "@/lib/utils"

function Alert(props: React.ComponentProps<typeof BaseAlert>) {
  return <BaseAlert {...props} />
}

function AlertDescription(props: React.ComponentProps<typeof BaseAlertDescription>) {
  return <BaseAlertDescription {...props} />
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertTitle>) {
  return <BaseAlertTitle className={cn("font-normal", className)} {...props} />
}

export { Alert, AlertDescription, AlertTitle }
