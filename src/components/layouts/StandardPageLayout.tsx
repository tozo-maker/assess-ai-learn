
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSFlexContainer
} from '@/components/ui/design-system';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface StandardPageLayoutProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  backLink?: string;
  children: React.ReactNode;
  className?: string;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  breadcrumbs,
  actions,
  backLink,
  children,
  className = ''
}) => {
  return (
    <DSSection className={className}>
      <DSPageContainer>
        {/* Back Link */}
        {backLink && (
          <div className="mb-4">
            <Link 
              to={backLink}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </div>
        )}

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={item.href} className="text-gray-600 hover:text-gray-900">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-gray-900 font-medium">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Fixed Header */}
        <div className="h-16 flex items-center justify-between border-b border-gray-200 mb-8">
          <DSPageTitle>{title}</DSPageTitle>
          {actions && (
            <DSFlexContainer gap="md">
              {actions}
            </DSFlexContainer>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-12">
          {children}
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

export default StandardPageLayout;
