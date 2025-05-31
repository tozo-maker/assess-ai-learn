
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Lightbulb,
  BarChart3,
  Settings,
  Mail,
  Target,
  Palette,
  BookOpen,
  TestTube,
  Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: "/app/students",
    icon: Users,
  },
  {
    title: "Assessments",
    url: "/app/assessments",
    icon: FileText,
  },
  {
    title: "Insights",
    url: "/app/insights/class",
    icon: Lightbulb,
  },
  {
    title: "Goals",
    url: "/app/students",
    icon: Target,
  },
  {
    title: "Reports",
    url: "/app/reports/progress",
    icon: BarChart3,
  },
  {
    title: "Communications",
    url: "/app/communications/progress-reports",
    icon: Mail,
  },
  {
    title: "Skills",
    url: "/app/skills",
    icon: BookOpen,
  },
  {
    title: "Design System",
    url: "/app/design-system",
    icon: Palette,
  },
  {
    title: "Testing",
    url: "/app/testing",
    icon: TestTube,
  },
  {
    title: "Settings",
    url: "/app/settings/profile",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-gray-200">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/app/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LayoutDashboard className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">LearnSpark AI</span>
                    <span className="truncate text-xs">Educational Analytics</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === item.url || 
                    (item.url !== '/app/dashboard' && location.pathname.startsWith(item.url))}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

// Mobile sidebar component for Header.tsx
export function AppMobileSidebar() {
  const location = useLocation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="space-y-1">
          <div className="flex items-center space-x-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">LearnSpark AI</span>
          </div>
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.url || 
                (item.url !== '/app/dashboard' && location.pathname.startsWith(item.url))
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
