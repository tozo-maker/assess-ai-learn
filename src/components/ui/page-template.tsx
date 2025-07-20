
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: string;
  className?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  description,
  actions,
  children,
  breadcrumbs,
  backLink,
  className
}) => {
  return (
    <StandardPageLayout
      title={title}
      description={description}
      actions={actions}
      breadcrumbs={breadcrumbs}
      backLink={backLink}
      className={className}
    >
      {children}
    </StandardPageLayout>
  );
};

export default PageTemplate;
