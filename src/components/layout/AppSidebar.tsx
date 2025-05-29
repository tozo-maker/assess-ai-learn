
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
import {
  Home,
  Menu,
  Settings,
  Users,
  FileText,
  BarChart3,
  Target,
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
  const { user } = useAuth();

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
    const isSubItem = !!item.items;

    return (
      <li key={item.title}>
        <NavLink
          to={item.url}
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${
            isActive ? "bg-gray-100 font-medium" : ""
          }`}
          onClick={(e) => {
            console.log(`Desktop navigating to: ${item.url}`);
            console.log('Current location:', location.pathname);
            console.log('NavLink event:', e);
          }}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
        {isSubItem && item.items && (
          <ul className="ml-4">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavLink
                  to={subItem.url}
                  className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${
                    location.pathname === subItem.url
                      ? "bg-gray-100 font-medium"
                      : ""
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
    <div className="border-r h-full w-60 flex-shrink-0 hidden md:block">
      <div className="p-4">
        <h1 className="text-2xl font-bold">LearnSpark AI</h1>
        <p className="text-sm text-gray-500">
          Welcome, {user?.email || "Teacher"}!
        </p>
      </div>
      <Separator />
      <nav className="mt-4">
        <ul>{navigationItems.map(renderNavItem)}</ul>
      </nav>
    </div>
  );
};

export const AppMobileSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: Omit<NavItem, "icon">[];
  }

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
    const isSubItem = !!item.items;

    return (
      <li key={item.title}>
        <NavLink
          to={item.url}
          className={`flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100 ${
            isActive ? "bg-gray-100 font-medium" : ""
          }`}
          onClick={(e) => {
            console.log(`Mobile navigating to: ${item.url}`);
            console.log('Current location:', location.pathname);
            console.log('Mobile NavLink event:', e);
          }}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
        {isSubItem && item.items && (
          <ul className="ml-4">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavLink
                  to={subItem.url}
                  className={`flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100 ${
                    location.pathname === subItem.url
                      ? "bg-gray-100 font-medium"
                      : ""
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
        <Menu className="md:hidden" />
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[280px] p-0">
        <SheetHeader className="pl-5 pt-5">
          <SheetTitle>LearnSpark AI</SheetTitle>
          <SheetDescription>
            Welcome, {user?.email || "Teacher"}!
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <nav className="mt-4">
          <ul className="p-5">{navigationItems.map(renderNavItem)}</ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
