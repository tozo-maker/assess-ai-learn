import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Target,
  HelpCircle,
  TestTube,
  BarChart3
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/app/students', icon: Users },
    { name: 'Assessments', href: '/app/assessments', icon: FileText },
    { name: 'Goals', href: '/app/goals', icon: Target },
    { name: 'Reports', href: '/app/reports', icon: BarChart3 }, // Added Reports
    { name: 'Testing', href: '/app/testing', icon: TestTube },
    { name: 'Help', href: '/app/help', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-6 py-2">
        <Link to="/app/dashboard" className="flex items-center text-lg font-semibold">
          LearnSpark AI
        </Link>
      </div>
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200',
                  location.pathname === item.href
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700'
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppSidebar;
