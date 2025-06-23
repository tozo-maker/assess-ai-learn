
import React from 'react';
import { Plus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyDataStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  title = 'No data available',
  description = 'Get started by adding your first item.',
  actionLabel = 'Add Item',
  onAction,
  icon,
  className = ''
}) => {
  const IconComponent = icon || <Database className="h-12 w-12 text-gray-400" />;

  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {IconComponent}
          </div>
          <CardTitle className="text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{description}</p>
          {onAction && (
            <Button onClick={onAction} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyDataState;
