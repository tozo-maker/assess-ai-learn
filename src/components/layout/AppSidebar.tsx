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
  DSSidebar,
  DSSidebarNav,
  DSSidebarNavItem,
  DSSidebarBottom,
  DSSidebarSettings,
  DSSidebarHelp,
  DSSidebarLogout,
  designSystem
} from '@/components/ui/design-system';

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
    title: 'Insights',
    url: '/app/insights/class',
    icon: Brain,
  },
  {
    title: 'Communications',
    url: '/app/communications/progress-reports',
    icon: Mail,
  },
  {
    title: 'Skills',
    url: '/app/skills',
    icon: Award,
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
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DSSidebar>
      <DSSidebarNav>
        {navigation.map((item) => (
          <DSSidebarNavItem key={item.title} to={item.url} as={NavLink}>
            <item.icon className="h-4 w-4 mr-2" strokeWidth="2" />
            {item.title}
          </DSSidebarNavItem>
        ))}
      </DSSidebarNav>

      <DSSidebarBottom>
        <DSSidebarSettings>
          {settingsNavigation.map((item) => (
            <DSSidebarNavItem key={item.title} to={item.url} as={NavLink}>
              <item.icon className="h-4 w-4 mr-2" strokeWidth="2" />
              {item.title}
            </DSSidebarNavItem>
          ))}
        </DSSidebarSettings>
        <DSSidebarHelp>
          Need help? <a href="mailto:support@learnspark.ai" className={designSystem.link}>Contact support</a>
        </DSSidebarHelp>
        <DSSidebarLogout onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" strokeWidth="2" />
          Log Out
        </DSSidebarLogout>
      </DSSidebarBottom>
    </DSSidebar>
  );
};

export default AppSidebar;
