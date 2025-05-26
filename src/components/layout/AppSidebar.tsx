
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Target, 
  FileOutput, 
  Settings,
  Zap, // Changed from TestTube to Zap for enhanced testing
  LogOut,
  GraduationCap
} from 'lucide-react';

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Students', href: '/app/students', icon: Users },
    { name: 'Assessments', href: '/app/assessments', icon: FileText },
    { name: 'Insights', href: '/app/insights', icon: BarChart3 },
    { name: 'Goals', href: '/app/goals', icon: Target },
    { name: 'Reports', href: '/app/reports', icon: FileOutput },
    { name: 'Advanced Testing', href: '/app/testing', icon: Zap }, // Updated name and icon
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
        <Link to="/app" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">LearnSpark AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/app' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {profile?.full_name?.charAt(0) || 'T'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'Teacher'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.school || 'School'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-gray-600 hover:text-gray-900"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
