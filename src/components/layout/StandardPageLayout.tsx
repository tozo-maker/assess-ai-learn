
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
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: PageAction[];
  children: React.ReactNode;
  className?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  description,
  badge,
  actions = [],
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
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  action.variant === 'destructive' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : action.variant === 'outline'
                    ? 'border border-gray-300 bg-transparent hover:bg-gray-50'
                    : action.variant === 'secondary'
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : action.variant === 'ghost'
                    ? 'bg-transparent hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.label}
              </button>
            ))}
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
