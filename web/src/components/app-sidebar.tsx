import * as React from "react"
import { ChevronRight, Command, FolderOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import type { SidebarCaseItem } from "@/lib/sanity/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/ui-kit"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  children?: Array<{
    title: string
    url: string
  }>
}

type NavSection = {
  title: string
  url: string
  items: NavItem[]
}

const data: { navMain: NavSection[] } = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Кейсы",
          url: "/cases",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "Build Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
        },
      ],
    },
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  pathname: string
  sidebarCaseItems: SidebarCaseItem[]
}

function isItemActive(pathname: string, url: string) {
  if (!url.startsWith("/")) {
    return false
  }

  if (url === "/") {
    return pathname === "/"
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}

function isItemExactActive(pathname: string, url: string) {
  if (!url.startsWith("/")) {
    return false
  }

  if (url === "/") {
    return pathname === "/"
  }

  return pathname === url
}

export function AppSidebar({
  pathname,
  sidebarCaseItems,
  ...props
}: AppSidebarProps) {
  const navData = React.useMemo(() => {
    return data.navMain.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.url !== "/cases") {
          return item
        }

        return {
          ...item,
          children: sidebarCaseItems.map((caseItem) => ({
            title: caseItem.title,
            url: `/cases/${caseItem.slug}`,
          })),
        }
      }),
    }))
  }, [sidebarCaseItems])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">zarechnev.space</span>
                  <span className="truncate text-xs">Сайт-портфолио</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {navData.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((menuItem) => {
                  const hasChildren = Boolean(menuItem.children?.length)
                  const hasActiveChild = Boolean(
                    menuItem.children?.some((childItem) => isItemActive(pathname, childItem.url))
                  )
                  const isSelfActive = hasChildren
                    ? isItemExactActive(pathname, menuItem.url)
                    : isItemActive(pathname, menuItem.url)
                  const isActive = hasChildren ? isSelfActive && !hasActiveChild : isSelfActive
                  const shouldShowChildren = hasChildren && (isSelfActive || hasActiveChild)

                  return (
                    <SidebarMenuItem key={menuItem.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                      >
                        {menuItem.url.startsWith("/") ? (
                          <Link href={menuItem.url}>
                            {menuItem.icon ? (
                              <menuItem.icon className="size-4" aria-hidden="true" />
                            ) : null}
                            <span>{menuItem.title}</span>
                            {hasChildren ? (
                              <ChevronRight
                                aria-hidden="true"
                                className={`ml-auto size-4 text-muted-foreground transition-transform ${
                                  shouldShowChildren ? "rotate-90" : ""
                                }`}
                              />
                            ) : null}
                          </Link>
                        ) : (
                          <a href={menuItem.url}>
                            {menuItem.icon ? (
                              <menuItem.icon className="size-4" aria-hidden="true" />
                            ) : null}
                            <span>{menuItem.title}</span>
                            {hasChildren ? (
                              <ChevronRight
                                aria-hidden="true"
                                className={`ml-auto size-4 text-muted-foreground transition-transform ${
                                  shouldShowChildren ? "rotate-90" : ""
                                }`}
                              />
                            ) : null}
                          </a>
                        )}
                      </SidebarMenuButton>
                      {shouldShowChildren ? (
                        <SidebarMenuSub>
                          {menuItem.children?.map((childItem) => (
                            <SidebarMenuSubItem key={childItem.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive(pathname, childItem.url)}
                              >
                                <Link href={childItem.url}>
                                  <span>{childItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
