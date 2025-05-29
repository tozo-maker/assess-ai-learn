
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  Settings,
  Users,
  FileText,
  BarChart3,
  Target,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: Omit<NavItem, "icon">[];
}

const AppSidebar = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: Home,
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
      title: "Skills",
      url: "/app/skills",
      icon: Target,
    },
    {
      title: "Insights",
      url: "/app/insights/class",
      icon: BarChart3,
      items: [
        {
          title: "Class Insights", 
          url: "/app/insights/class"
        },
        {
          title: "Individual Analysis",
          url: "/app/insights/individual"
        },
        {
          title: "Skills Mastery",
          url: "/app/insights/skills"
        },
        {
          title: "Recommendations",
          url: "/app/insights/recommendations"
        }
      ]
    },
    {
      title: "Settings",
      url: "/app/settings/profile",
      icon: Settings,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.url;
    const hasSubItems = !!item.items;

    return (
      <li key={item.title}>
        <NavLink
          to={item.url}
          className={`flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors ${
            isActive ? "bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600" : "text-gray-700"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
        {hasSubItems && item.items && (
          <ul className="ml-8 mt-2 space-y-1">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavLink
                  to={subItem.url}
                  className={`flex items-center p-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                    location.pathname === subItem.url
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <span>{subItem.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="border-r bg-white h-screen w-64 flex-shrink-0 hidden md:block">
      {/* Sidebar Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LearnSpark AI</h1>
            <p className="text-sm text-gray-500">
              {profile?.full_name || user?.email || "Teacher"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">{navigationItems.map(renderNavItem)}</ul>
      </nav>
    </div>
  );
};

export const AppMobileSidebar = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: Home,
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
      title: "Skills",
      url: "/app/skills",
      icon: Target,
    },
    {
      title: "Insights",
      url: "/app/insights/class",
      icon: BarChart3,
      items: [
        {
          title: "Class Insights",
          url: "/app/insights/class",
        },
        {
          title: "Individual Analysis",
          url: "/app/insights/individual",
        },
        {
          title: "Skills Mastery",
          url: "/app/insights/skills",
        },
        {
          title: "Recommendations",
          url: "/app/insights/recommendations",
        },
      ],
    },
    {
      title: "Settings",
      url: "/app/settings/profile",
      icon: Settings,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.url;
    const hasSubItems = !!item.items;

    return (
      <li key={item.title}>
        <NavLink
          to={item.url}
          className={`flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors ${
            isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
        {hasSubItems && item.items && (
          <ul className="ml-8 mt-2 space-y-1">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavLink
                  to={subItem.url}
                  className={`flex items-center p-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                    location.pathname === subItem.url
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <span>{subItem.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg">LearnSpark AI</SheetTitle>
              <SheetDescription className="text-sm">
                {profile?.full_name || user?.email || "Teacher"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <nav className="p-4">
          <ul className="space-y-2">{navigationItems.map(renderNavItem)}</ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
