
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{
      label: 'Dashboard',
      href: '/app/dashboard'
    }];

    if (paths.length <= 2) {
      return [{
        label: 'Dashboard',
        isActive: true
      }];
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
      edit: 'Edit',
      profile: 'Profile',
      'class-insights': 'Class Insights',
      'individual-insights': 'Individual Insights',
      recommendations: 'Recommendations',
      'skills-insights': 'Skills Insights',
      'progress-reports': 'Progress Reports',
      batch: 'Batch Import',
      responses: 'Student Responses',
      analysis: 'Analysis'
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
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app/dashboard" className="flex items-center text-gray-500 hover:text-gray-700">
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbs.slice(1).map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.isActive ? (
                    <BreadcrumbPage className="font-medium text-gray-900">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href!} className="text-gray-500 hover:text-gray-700">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default Breadcrumbs;
