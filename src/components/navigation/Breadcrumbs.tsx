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
      profile: 'Profile',
      'class-insights': 'Class Insights',
      'individual-insights': 'Individual Insights',
      recommendations: 'Recommendations',
      'skills-insights': 'Skills Insights',
      'progress-reports': 'Progress Reports'
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
  return;
};
export default Breadcrumbs;