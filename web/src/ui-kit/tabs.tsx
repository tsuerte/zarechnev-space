"use client"

import * as React from "react"

import {
  Tabs as BaseTabs,
  TabsContent as BaseTabsContent,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

function Tabs(props: React.ComponentProps<typeof BaseTabs>) {
  return <BaseTabs {...props} />
}

function TabsList(props: React.ComponentProps<typeof BaseTabsList>) {
  return <BaseTabsList {...props} />
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger>) {
  return <BaseTabsTrigger className={cn("font-normal", className)} {...props} />
}

function TabsContent(props: React.ComponentProps<typeof BaseTabsContent>) {
  return <BaseTabsContent {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
