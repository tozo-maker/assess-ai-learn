
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Lightbulb,
  Mail,
  BarChart3,
  Settings,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const navigationItems: NavigationItem[] = [
  // Primary group
  { title: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  
  // Core features group
  { title: 'Students', href: '/app/students', icon: Users, group: 'core' },
  { title: 'Assessments', href: '/app/assessments', icon: FileText, group: 'core' },
  { title: 'Insights', href: '/app/insights/class', icon: Lightbulb, group: 'core' },
  
  // Communication & Reports group
  { title: 'Communications', href: '/app/communications/progress-reports', icon: Mail, group: 'reporting' },
  { title: 'Reports', href: '/app/reports/progress', icon: BarChart3, group: 'reporting' },
  
  // System group
  { title: 'Settings', href: '/app/settings/profile', icon: Settings, group: 'system' },
  { title: 'Help', href: '/help', icon: HelpCircle, group: 'system' },
];

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const renderNavigationGroup = (items: NavigationItem[], groupTitle?: string) => (
    <div className="space-y-1">
      {groupTitle && (
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {groupTitle}
          </h3>
        </div>
      )}
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center py-2 px-4 mx-2 rounded-lg text-base transition-colors duration-200",
            isActive(item.href)
              ? "bg-primary/10 text-primary font-medium"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <item.icon className={cn(
            "w-5 h-5 mr-3",
            isActive(item.href) ? "text-primary" : "text-gray-400"
          )} />
          <span>{item.title}</span>
        </Link>
      ))}
    </div>
  );

  // Group items by their group property
  const primaryItems = navigationItems.filter(item => !item.group);
  const coreItems = navigationItems.filter(item => item.group === 'core');
  const reportingItems = navigationItems.filter(item => item.group === 'reporting');
  const systemItems = navigationItems.filter(item => item.group === 'system');

  return (
    <div className="w-64 fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link to="/app/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">LearnSpark AI</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Primary Navigation */}
          {renderNavigationGroup(primaryItems)}

          {/* Separator */}
          <div className="mx-4 border-t border-gray-200" />

          {/* Core Features */}
          {renderNavigationGroup(coreItems)}

          {/* Separator */}
          <div className="mx-4 border-t border-gray-200" />

          {/* Reporting */}
          {renderNavigationGroup(reportingItems)}

          {/* Separator */}
          <div className="mx-4 border-t border-gray-200" />

          {/* System */}
          {renderNavigationGroup(systemItems)}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
