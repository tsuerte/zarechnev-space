"use client"

import { Fragment, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import type { SidebarCaseItem } from "@/lib/sanity/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarProvider,
  SidebarTrigger,
} from "@/ui-kit"

type Crumb = {
  key: string
  href: string
  label: string
}

const segmentLabels: Record<string, string> = {
  cases: "Кейсы",
}

function humanizeSegment(segment: string) {
  return (
    segmentLabels[segment] ??
    decodeURIComponent(segment).replace(/-/g, " ")
  )
}

function resolveSectionLabel(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/cases")) {
    return "Getting Started"
  }

  return "Build Your Application"
}

function resolveCrumbLabel(
  parts: string[],
  index: number,
  segment: string,
  caseTitleBySlug: Map<string, string>
) {
  if (parts[0] === "cases" && index === 1) {
    const decodedSlug = decodeURIComponent(segment)
    return caseTitleBySlug.get(decodedSlug) ?? humanizeSegment(segment)
  }

  return humanizeSegment(segment)
}

function buildCrumbs(pathname: string, caseTitleBySlug: Map<string, string>): Crumb[] {
  const sectionCrumb: Crumb = {
    key: "section",
    href: "/",
    label: resolveSectionLabel(pathname),
  }

  const parts = pathname.split("/").filter(Boolean)

  if (parts.length === 0) {
    return [
      sectionCrumb,
      { key: "current-home", href: "/", label: "Главная" },
    ]
  }

  const pathCrumbs = parts.map((part, index) => ({
    key: `path-${index}`,
    href: `/${parts.slice(0, index + 1).join("/")}`,
    label: resolveCrumbLabel(parts, index, part, caseTitleBySlug),
  }))

  return [sectionCrumb, ...pathCrumbs]
}

type AppShellProps = {
  children: React.ReactNode
  sidebarCaseItems: SidebarCaseItem[]
}

export function AppShell({ children, sidebarCaseItems }: AppShellProps) {
  const pathname = usePathname()
  const caseTitleBySlug = useMemo(
    () => new Map(sidebarCaseItems.map((caseItem) => [caseItem.slug, caseItem.title])),
    [sidebarCaseItems]
  )
  const crumbs = buildCrumbs(pathname, caseTitleBySlug)

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} sidebarCaseItems={sidebarCaseItems} />
      <div className="relative flex h-svh w-full flex-1 flex-col overflow-y-auto bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1
                const hideOnMobile = !isLast

                return (
                  <Fragment key={crumb.key}>
                    <BreadcrumbItem className={hideOnMobile ? "hidden md:block" : undefined}>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast ? (
                      <BreadcrumbSeparator className="hidden md:block" />
                    ) : null}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">{children}</div>
      </div>
    </SidebarProvider>
  )
}
