
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  FileText,
  Lightbulb,
  Menu,
  GraduationCap
} from 'lucide-react';

const primaryTabItems = [
  { title: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { title: 'Students', href: '/app/students', icon: Users },
  { title: 'Assessments', href: '/app/assessments', icon: FileText },
  { title: 'Insights', href: '/app/insights/class', icon: Lightbulb },
];

const secondaryItems = [
  { title: 'Communications', href: '/app/communications/progress-reports' },
  { title: 'Reports', href: '/app/reports/progress' },
  { title: 'Settings', href: '/app/settings/profile' },
  { title: 'Help', href: '/help' },
];

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <Link to="/app/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">LearnSpark AI</span>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="space-y-4 mt-6">
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block py-3 px-4 rounded-lg text-base transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4">
          {primaryTabItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 min-h-[44px] transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
