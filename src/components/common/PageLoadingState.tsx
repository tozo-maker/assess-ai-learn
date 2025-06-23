
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PageLoadingStateProps {
  message?: string;
  className?: string;
}

const PageLoadingState: React.FC<PageLoadingStateProps> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-gray-600 text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageLoadingState;
