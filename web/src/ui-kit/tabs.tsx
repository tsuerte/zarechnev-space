"use client"

import * as React from "react"

import {
  Tabs as BaseTabs,
  TabsContent as BaseTabsContent,
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type TabsSize = "sm" | "md"

const TabsSizeContext = React.createContext<TabsSize>("md")

const tabsListSizeClasses: Record<TabsSize, string> = {
  sm: "h-8 p-1 rounded-md",
  md: "h-10 p-1 rounded-md",
}

const tabsTriggerSizeClasses: Record<TabsSize, string> = {
  sm: "h-auto px-2 py-1 text-sm leading-4 rounded-sm",
  md: "h-auto px-3 py-2 text-sm leading-4 rounded-sm",
}

type TabsProps = React.ComponentProps<typeof BaseTabs> & {
  size?: TabsSize
}

function Tabs({ size = "md", ...props }: TabsProps) {
  return (
    <TabsSizeContext.Provider value={size}>
      <BaseTabs {...props} />
    </TabsSizeContext.Provider>
  )
}

function TabsList({
  size,
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsList> & {
  size?: TabsSize
}) {
  const inheritedSize = React.useContext(TabsSizeContext)
  const resolvedSize = size ?? inheritedSize

  return (
    <BaseTabsList
      className={cn("bg-surface-soft", tabsListSizeClasses[resolvedSize], className)}
      {...props}
    />
  )
}

function TabsTrigger({
  size,
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger> & {
  size?: TabsSize
}) {
  const inheritedSize = React.useContext(TabsSizeContext)
  const resolvedSize = size ?? inheritedSize

  return (
    <BaseTabsTrigger
      className={cn(
        "font-normal text-foreground border-0 data-[state=active]:border-0 data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-tabs-active)]",
        tabsTriggerSizeClasses[resolvedSize],
        className
      )}
      {...props}
    />
  )
}

function TabsContent(props: React.ComponentProps<typeof BaseTabsContent>) {
  return <BaseTabsContent {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
