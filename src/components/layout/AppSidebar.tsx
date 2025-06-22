
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  Target,
  HelpCircle,
  TestTube,
  BarChart3,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  ];

  const coreFeatures = [
    { name: 'Students', href: '/app/students', icon: Users },
    { name: 'Assessments', href: '/app/assessments', icon: FileText },
    { name: 'Goals', href: '/app/goals', icon: Target },
  ];

  const communications = [
    { name: 'Communications', href: '/app/communications', icon: MessageSquare },
  ];

  const reporting = [
    { name: 'Reports', href: '/app/reports', icon: BarChart3 },
    { name: 'Progress Reports', href: '/app/reports/progress-reports', icon: FileText },
  ];

  const system = [
    { name: 'Testing', href: '/app/testing', icon: TestTube },
    { name: 'Help', href: '/app/help', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/app/dashboard" className="flex items-center space-x-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">LearnSpark AI</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Core Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreFeatures.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Communications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communications.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reporting</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reporting.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
