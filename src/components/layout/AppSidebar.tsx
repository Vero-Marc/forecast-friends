import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  FileBarChart2,
  ShieldCheck,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  Receipt,
  Undo2,
  Wallet,
  Handshake,
  SearchCheck,
  Send,
  LineChart,
} from "lucide-react";
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const primary = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Onboarding", url: "/onboarding", icon: ClipboardList },
  { title: "Organizations", url: "/organizations", icon: Building2 },
  { title: "Recent Reports", url: "/reports", icon: FileBarChart2 },
];

const access = [
  { title: "Role Management", url: "/roles", icon: ShieldCheck },
  { title: "User Management", url: "/users", icon: Users },
];

type GroupItem = {
  title: string;
  icon: any;
  children: { title: string; url: string; icon: any }[];
};

const services: GroupItem[] = [
  {
    title: "Payins Service",
    icon: ArrowDownToLine,
    children: [
      { title: "Transactions", url: "/payins/transactions", icon: Receipt },
      { title: "Refunds", url: "/payins/refunds", icon: Undo2 },
      { title: "Settlements", url: "/payins/settlements", icon: Wallet },
    ],
  },
  {
    title: "Payouts Service",
    icon: ArrowUpFromLine,
    children: [
      { title: "Transactions", url: "/payouts/transactions", icon: Receipt },
      { title: "Partner Settlements", url: "/payouts/partner-settlements", icon: Handshake },
      { title: "Check Status", url: "/payouts/check-status", icon: SearchCheck },
      { title: "Fund Transfer", url: "/payouts/fund-transfer", icon: Send },
      { title: "Transaction Insights", url: "/payouts/insights", icon: LineChart },
      { title: "Wallet Management", url: "/payouts/wallets", icon: Wallet },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" :
    url === "/onboarding" ? pathname === "/onboarding" || pathname.startsWith("/onboarding/") :
    pathname.startsWith(url);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    "Payins Service": pathname.startsWith("/payins"),
    "Payouts Service": pathname.startsWith("/payouts"),
  }));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center">
        <div className={cn("flex items-center gap-2.5 px-2", collapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">Fynnix</span>
              <span className="text-[11px] text-muted-foreground">Admin Console</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {services.map((group) => {
                const groupActive = group.children.some((c) => isActive(c.url));
                const open = openGroups[group.title] ?? groupActive;
                return (
                  <Collapsible
                    key={group.title}
                    open={open}
                    onOpenChange={(v) => setOpenGroups((s) => ({ ...s, [group.title]: v }))}
                    asChild
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.title} isActive={groupActive}>
                          <group.icon className="h-4 w-4" />
                          <span>{group.title}</span>
                          <ChevronRight
                            className={cn(
                              "ml-auto h-3.5 w-3.5 transition-transform",
                              open && "rotate-90"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                                <NavLink to={child.url}>
                                  <child.icon className="h-3.5 w-3.5" />
                                  <span>{child.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {access.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">SC</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-medium truncate">Sarah Chen</span>
              <span className="text-xs text-muted-foreground truncate">Compliance Admin</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
