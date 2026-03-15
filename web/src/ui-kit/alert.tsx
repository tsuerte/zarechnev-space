"use client"

import * as React from "react"

import {
  Alert as BaseAlert,
  AlertDescription as BaseAlertDescription,
  AlertTitle as BaseAlertTitle,
} from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type AlertTone = "default" | "info" | "success" | "warning"

const alertToneClasses: Record<AlertTone, string> = {
  default: "",
  info:
    "border-blue-200 bg-blue-50 text-blue-950 *:data-[slot=alert-description]:text-current",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 *:data-[slot=alert-description]:text-current",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 *:data-[slot=alert-description]:text-current",
}

function Alert({
  tone = "default",
  className,
  ...props
}: React.ComponentProps<typeof BaseAlert> & {
  tone?: AlertTone
}) {
  return <BaseAlert className={cn(alertToneClasses[tone], className)} {...props} />
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
