
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Target, 
  BarChart3, 
  FileText, 
  MessageSquare,
  Settings,
  TrendingUp,
  Brain,
  GitCompare
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Students', href: '/app/students', icon: Users },
  { name: 'Assessments', href: '/app/assessments', icon: ClipboardList },
  { name: 'Goals', href: '/app/goals', icon: Target },
  {
    name: 'Insights',
    icon: BarChart3,
    children: [
      { name: 'Class Analytics', href: '/app/insights/class', icon: TrendingUp },
      { name: 'Skills Mastery', href: '/app/insights/skills', icon: Brain },
      { name: 'Comparative Analytics', href: '/app/insights/comparative', icon: GitCompare },
    ],
  },
  { name: 'Reports', href: '/app/reports', icon: FileText },
  { name: 'Communication', href: '/app/communication', icon: MessageSquare },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const isChildActive = (children: any[]) => {
    return children.some(child => isActive(child.href));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">LearnSpark AI</span>
          </div>
        </div>
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              const hasActiveChild = isChildActive(item.children);
              return (
                <div key={item.name}>
                  <div className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    hasActiveChild
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}>
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        hasActiveChild ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={cn(
                          'group flex items-center pl-6 pr-2 py-2 text-sm font-medium rounded-md',
                          isActive(child.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <child.icon
                          className={cn(
                            'mr-3 flex-shrink-0 h-4 w-4',
                            isActive(child.href)
                              ? 'text-blue-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          )}
                          aria-hidden="true"
                        />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive(item.href)
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
