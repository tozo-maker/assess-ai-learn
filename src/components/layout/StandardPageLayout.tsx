
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  breadcrumbs?: Array<{ label: string; href?: string; }>;
  backLink?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  description,
  subtitle,
  badge,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Breadcrumbs />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || 'default'}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default StandardPageLayout;
