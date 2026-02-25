"use client"

import * as React from "react"

import {
  Sidebar as BaseSidebar,
  SidebarContent as BaseSidebarContent,
  SidebarFooter as BaseSidebarFooter,
  SidebarGroup as BaseSidebarGroup,
  SidebarGroupAction as BaseSidebarGroupAction,
  SidebarGroupContent as BaseSidebarGroupContent,
  SidebarGroupLabel as BaseSidebarGroupLabel,
  SidebarHeader as BaseSidebarHeader,
  SidebarInput as BaseSidebarInput,
  SidebarInset as BaseSidebarInset,
  SidebarMenu as BaseSidebarMenu,
  SidebarMenuAction as BaseSidebarMenuAction,
  SidebarMenuBadge as BaseSidebarMenuBadge,
  SidebarMenuButton as BaseSidebarMenuButton,
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuSkeleton as BaseSidebarMenuSkeleton,
  SidebarMenuSub as BaseSidebarMenuSub,
  SidebarMenuSubButton as BaseSidebarMenuSubButton,
  SidebarMenuSubItem as BaseSidebarMenuSubItem,
  SidebarProvider as BaseSidebarProvider,
  SidebarRail as BaseSidebarRail,
  SidebarSeparator as BaseSidebarSeparator,
  SidebarTrigger as BaseSidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

function Sidebar(props: React.ComponentProps<typeof BaseSidebar>) {
  return <BaseSidebar {...props} />
}

function SidebarProvider(props: React.ComponentProps<typeof BaseSidebarProvider>) {
  return <BaseSidebarProvider {...props} />
}

function SidebarTrigger(props: React.ComponentProps<typeof BaseSidebarTrigger>) {
  return <BaseSidebarTrigger {...props} />
}

function SidebarRail(props: React.ComponentProps<typeof BaseSidebarRail>) {
  return <BaseSidebarRail {...props} />
}

function SidebarInset(props: React.ComponentProps<typeof BaseSidebarInset>) {
  return <BaseSidebarInset {...props} />
}

function SidebarInput(props: React.ComponentProps<typeof BaseSidebarInput>) {
  return <BaseSidebarInput {...props} />
}

function SidebarHeader(props: React.ComponentProps<typeof BaseSidebarHeader>) {
  return <BaseSidebarHeader {...props} />
}

function SidebarFooter(props: React.ComponentProps<typeof BaseSidebarFooter>) {
  return <BaseSidebarFooter {...props} />
}

function SidebarSeparator(props: React.ComponentProps<typeof BaseSidebarSeparator>) {
  return <BaseSidebarSeparator {...props} />
}

function SidebarContent(props: React.ComponentProps<typeof BaseSidebarContent>) {
  return <BaseSidebarContent {...props} />
}

function SidebarGroup(props: React.ComponentProps<typeof BaseSidebarGroup>) {
  return <BaseSidebarGroup {...props} />
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseSidebarGroupLabel>) {
  return <BaseSidebarGroupLabel className={cn("font-normal", className)} {...props} />
}

function SidebarGroupAction(props: React.ComponentProps<typeof BaseSidebarGroupAction>) {
  return <BaseSidebarGroupAction {...props} />
}

function SidebarGroupContent(props: React.ComponentProps<typeof BaseSidebarGroupContent>) {
  return <BaseSidebarGroupContent {...props} />
}

function SidebarMenu(props: React.ComponentProps<typeof BaseSidebarMenu>) {
  return <BaseSidebarMenu {...props} />
}

function SidebarMenuItem(props: React.ComponentProps<typeof BaseSidebarMenuItem>) {
  return <BaseSidebarMenuItem {...props} />
}

function SidebarMenuButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSidebarMenuButton>) {
  return (
    <BaseSidebarMenuButton
      className={cn("data-[active=true]:font-normal", className)}
      {...props}
    />
  )
}

function SidebarMenuAction(props: React.ComponentProps<typeof BaseSidebarMenuAction>) {
  return <BaseSidebarMenuAction {...props} />
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<typeof BaseSidebarMenuBadge>) {
  return <BaseSidebarMenuBadge className={cn("font-normal", className)} {...props} />
}

function SidebarMenuSkeleton(props: React.ComponentProps<typeof BaseSidebarMenuSkeleton>) {
  return <BaseSidebarMenuSkeleton {...props} />
}

function SidebarMenuSub(props: React.ComponentProps<typeof BaseSidebarMenuSub>) {
  return <BaseSidebarMenuSub {...props} />
}

function SidebarMenuSubItem(props: React.ComponentProps<typeof BaseSidebarMenuSubItem>) {
  return <BaseSidebarMenuSubItem {...props} />
}

function SidebarMenuSubButton(props: React.ComponentProps<typeof BaseSidebarMenuSubButton>) {
  return <BaseSidebarMenuSubButton {...props} />
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
}
