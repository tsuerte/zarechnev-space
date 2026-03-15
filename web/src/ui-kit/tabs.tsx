"use client"

import * as React from "react"

import {
  Tabs as BaseTabs,
  TabsContent as BaseTabsContent,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const Tabs = BaseTabs
const TabsList = BaseTabsList

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger>) {
  return <BaseTabsTrigger className={cn("font-normal", className)} {...props} />
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsContent>) {
  return (
    <BaseTabsContent
      className={cn("data-[state=inactive]:hidden", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
