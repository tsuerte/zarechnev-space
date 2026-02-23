import {
  ArrowRight,
  Check,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  GalleryVerticalEnd,
  MoreHorizontal,
  PanelLeft,
  Search,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type IconPlaceholderProps = {
  className?: string
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
}

const remixIcons: Record<string, LucideIcon> = {
  RiArrowRightSLine: ArrowRight,
  RiArrowUpDownLine: ChevronsUpDown,
  RiCheckLine: Check,
  RiCloseLine: X,
  RiGalleryLine: GalleryVerticalEnd,
  RiMoreLine: MoreHorizontal,
  RiSearchLine: Search,
  RiSideBarLine: PanelLeft,
}

const lucideIcons: Record<string, LucideIcon> = {
  ChevronRightIcon: ChevronRight,
  MoreHorizontalIcon: MoreHorizontal,
  CheckIcon: Check,
  XIcon: X,
  PanelLeftIcon: PanelLeft,
  GalleryVerticalEndIcon: GalleryVerticalEnd,
  ChevronsUpDownIcon: ChevronsUpDown,
  SearchIcon: Search,
}

export function IconPlaceholder({
  className,
  lucide,
  remixicon,
}: IconPlaceholderProps) {
  const Icon =
    (lucide && lucideIcons[lucide]) ||
    (remixicon && remixIcons[remixicon]) ||
    CircleHelp

  return <Icon aria-hidden="true" className={cn("size-4", className)} />
}
