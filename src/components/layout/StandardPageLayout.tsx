
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: string;
  breadcrumbs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  description,
  icon,
  actions,
  backLink,
  breadcrumbs,
  children,
  className = ''
}) => {
  return (
    <div className={`content-spacing ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}

      {/* Back Link */}
      {backLink && (
        <div className="mb-4">
          <Link to={backLink}>
            <Button variant="ghost" size="sm" className="pl-0">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h1 className="page-title">{title}</h1>
              {description && (
                <p className="page-description">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="content-spacing">
        {children}
      </div>
    </div>
  );
};

export default StandardPageLayout;
