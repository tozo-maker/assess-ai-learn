
import React from 'react';
import {
  Home,
  Users,
  FileText,
  Target,
  Brain,
  Mail,
  Award,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navigation = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: Home,
  },
  {
    title: 'Students',
    url: '/app/students',
    icon: Users,
  },
  {
    title: 'Assessments',
    url: '/app/assessments',
    icon: FileText,
  },
  {
    title: 'Goals',
    url: '/app/goals',
    icon: Target,
  },
  {
    title: 'Skills',
    url: '/app/skills',
    icon: Award,
  },
  {
    title: 'Insights',
    url: '/app/insights/class',
    icon: Brain,
  },
  {
    title: 'Communications',
    url: '/app/communications/progress-reports',
    icon: Mail,
  },
];

const settingsNavigation = [
  {
    title: 'Settings',
    url: '/app/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    url: '/app/help',
    icon: HelpCircle,
  },
];

const AppSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg">LearnSpark AI</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      }
                    >
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

      <SidebarFooter>
        <div className="px-4 py-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            Need help? <a href="mailto:support@learnspark.ai" className="text-primary hover:underline">Contact support</a>
          </p>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
