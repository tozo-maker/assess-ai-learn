
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'cards';
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  className = '' 
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center min-h-32 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-6 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
