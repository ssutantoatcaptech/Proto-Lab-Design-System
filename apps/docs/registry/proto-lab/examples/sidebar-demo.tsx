import { BriefcaseIcon, ClockIcon, LayoutDashboardIcon, PresentationIcon } from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/registry/proto-lab/ui/sidebar"

const nav = [
  { label: "Overview", icon: LayoutDashboardIcon, active: true },
  { label: "Engagements", icon: BriefcaseIcon },
  { label: "Workshops", icon: PresentationIcon },
  { label: "Timesheets", icon: ClockIcon },
]

export default function SidebarDemo() {
  return (
    <div className="relative h-80 w-full overflow-hidden rounded-md border">
      <SidebarProvider className="min-h-0 h-full">
        <Sidebar collapsible="icon" className="absolute h-full">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Proto-Lab</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton isActive={item.active} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center gap-2 border-b p-2">
            <SidebarTrigger />
            <span className="text-sm font-medium">Overview</span>
          </header>
          <div className="p-4 text-sm text-muted-foreground">Three engagements need timesheet approval.</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
