
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/app/dashboard' }
    ];

    if (paths.length <= 2) {
      return [{ label: 'Dashboard', isActive: true }];
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
      add: 'Add New',
      profile: 'Profile',
      'class-insights': 'Class Insights',
      'individual-insights': 'Individual Insights',
      recommendations: 'Recommendations',
      'skills-insights': 'Skills Insights'
    };

    let currentPath = '/app';
    
    appPaths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === appPaths.length - 1;
      
      breadcrumbs.push({
        label: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
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
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {breadcrumb.isActive ? (
            <span className="font-medium text-gray-900">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.href!}
              className="hover:text-blue-600 transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
