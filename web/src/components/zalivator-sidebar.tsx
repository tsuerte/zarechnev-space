import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/ui-kit"

export function ZalivatorSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-background">
      <SidebarGroup>
        <SidebarGroupLabel>Разделы</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive
                className="hover:bg-surface-soft data-[active=true]:bg-surface-soft data-[active=true]:hover:bg-surface-soft"
              >
                <span>Single</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="hover:bg-surface-soft">
                <span>Batch</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </aside>
  )
}
