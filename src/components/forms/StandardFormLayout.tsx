
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StandardFormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showCard?: boolean;
}

const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  title,
  description,
  children,
  className = '',
  showCard = true
}) => {
  if (!showCard) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardFormLayout;
