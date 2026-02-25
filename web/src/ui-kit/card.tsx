"use client"

import * as React from "react"

import {
  Card as BaseCard,
  CardAction as BaseCardAction,
  CardContent as BaseCardContent,
  CardDescription as BaseCardDescription,
  CardFooter as BaseCardFooter,
  CardHeader as BaseCardHeader,
  CardTitle as BaseCardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

function Card(props: React.ComponentProps<typeof BaseCard>) {
  return <BaseCard {...props} />
}

function CardHeader(props: React.ComponentProps<typeof BaseCardHeader>) {
  return <BaseCardHeader {...props} />
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseCardTitle>) {
  return <BaseCardTitle className={cn("font-normal", className)} {...props} />
}

function CardDescription(
  props: React.ComponentProps<typeof BaseCardDescription>
) {
  return <BaseCardDescription {...props} />
}

function CardAction(props: React.ComponentProps<typeof BaseCardAction>) {
  return <BaseCardAction {...props} />
}

function CardContent(props: React.ComponentProps<typeof BaseCardContent>) {
  return <BaseCardContent {...props} />
}

function CardFooter(props: React.ComponentProps<typeof BaseCardFooter>) {
  return <BaseCardFooter {...props} />
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
