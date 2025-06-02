
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSFlexContainer,
  DSPageTitle,
  DSBodyText,
  DSSpacer
} from '@/components/ui/design-system';

interface PageTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  headerContent?: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  description,
  actions,
  children,
  showBreadcrumbs = true,
  headerContent
}) => {
  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          {showBreadcrumbs && <Breadcrumbs />}
          
          {/* Standardized Page Header */}
          <DSCard className="mb-8">
            <DSCardHeader className="p-6">
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </DSPageTitle>
                  {description && (
                    <DSBodyText className="text-gray-600">
                      {description}
                    </DSBodyText>
                  )}
                  {headerContent}
                </div>
                {actions && (
                  <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                    {actions}
                  </DSFlexContainer>
                )}
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          <DSSpacer size="lg" />

          {/* Page Content */}
          {children}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default PageTemplate;
