
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const EnhancedBreadcrumbs: React.FC = () => {
  const location = useLocation();

  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/app/dashboard'
    });

    if (paths.length <= 2) {
      breadcrumbs[0].isActive = true;
      return breadcrumbs;
    }

    // Remove 'app' from the path
    const appPaths = paths.slice(1);
    
    const pathMap: Record<string, string> = {
      students: 'Students',
      assessments: 'Assessments',
      insights: 'Insights',
      reports: 'Reports',
      settings: 'Settings',
      communications: 'Communications',
      skills: 'Skills',
      add: 'Add New',
      import: 'Import',
      profile: 'Profile',
      notifications: 'Notifications',
      'class-insights': 'Class Insights',
      'individual-insights': 'Individual Insights',
      recommendations: 'Recommendations',
      'skills-insights': 'Skills Insights',
      'progress-reports': 'Progress Reports',
      'export-reports': 'Export Reports'
    };

    let currentPath = '/app';
    appPaths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === appPaths.length - 1;
      
      // Handle dynamic routes (like student IDs)
      let label = pathMap[path] || path;
      if (!pathMap[path] && /^\d+$/.test(path)) {
        // This is likely an ID, get context from previous path
        const previousPath = appPaths[index - 1];
        if (previousPath === 'students') {
          label = 'Student Details';
        } else if (previousPath === 'assessments') {
          label = 'Assessment Details';
        } else {
          label = 'Details';
        }
      } else if (!pathMap[path]) {
        // Capitalize first letter for unknown paths
        label = path.charAt(0).toUpperCase() + path.slice(1);
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <DSFlexContainer align="center" gap="xs" className="flex-wrap">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            
            {breadcrumb.isActive ? (
              <DSBodyText className={cn(
                "font-medium text-gray-900",
                "px-2 py-1 rounded-lg bg-gray-100"
              )}>
                {breadcrumb.label}
              </DSBodyText>
            ) : (
              <Link
                to={breadcrumb.href!}
                className={cn(
                  "px-2 py-1 rounded-lg transition-colors",
                  designSystem.transitions.normal,
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                )}
              >
                <DSBodyText className="font-medium">
                  {breadcrumb.label}
                </DSBodyText>
              </Link>
            )}
          </React.Fragment>
        ))}
      </DSFlexContainer>
      
      {/* Quick actions for current page */}
      <div className="mt-2">
        <DSHelpText>
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">⌘K</kbd> for quick actions
        </DSHelpText>
      </div>
    </nav>
  );
};

export default EnhancedBreadcrumbs;
