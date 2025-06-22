import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  Target,
  Mail
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Students', href: '/app/students', icon: Users },
    { name: 'Assessments', href: '/app/assessments', icon: FileText },
    { name: 'Insights', href: '/app/insights', icon: TrendingUp },
    { name: 'Goals', href: '/app/goals', icon: Target },
    { name: 'Communications', href: '/app/communications', icon: Mail },
    { name: 'Reports', href: '/app/reports', icon: BarChart3 },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col w-64 border-r bg-gray-50", className)}>
      <div className="px-4 py-6">
        <Link to="/app" className="flex items-center text-xl font-bold">
          LearnSpark AI
        </Link>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
              location.pathname === item.href
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
