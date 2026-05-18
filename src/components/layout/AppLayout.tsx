import { Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/onboarding": "Onboarding",
  "/organizations": "Organizations",
  "/documents": "Documents",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const topTitle = titleMap[`/${segments[0] ?? ""}`] ?? "Dashboard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 backdrop-blur-xl px-4 md:px-6">
            <SidebarTrigger />
            <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Fynnix</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{topTitle}</span>
              {segments[1] && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium capitalize">{segments[1]}</span>
                </>
              )}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations, documents…"
                  className="pl-9 w-72 h-9 bg-muted/60 border-transparent focus-visible:bg-background"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">SC</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">Sarah Chen</span>
                      <span className="text-xs text-muted-foreground font-normal">sarah@fynnix.io</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Workspace settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
