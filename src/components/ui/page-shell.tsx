
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageShellProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: string;
}

const PageShell: React.FC<PageShellProps> = ({ 
  title, 
  description, 
  icon, 
  children, 
  actions,
  backLink
}) => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {icon && <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>}
            <div>
              {backLink && (
                <Link to={backLink} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Back</span>
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          {actions && <div className="flex space-x-3">{actions}</div>}
        </div>
        
        {children || (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">This feature is under development and will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default PageShell;
