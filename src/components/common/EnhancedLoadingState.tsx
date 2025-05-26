
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, BookOpen, Users, BarChart3 } from 'lucide-react';

interface EnhancedLoadingStateProps {
  type?: 'dashboard' | 'table' | 'form' | 'cards' | 'spinner';
  message?: string;
  className?: string;
  rows?: number;
}

const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  className = '',
  rows = 5
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center min-h-32 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
          </div>
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className={`space-y-8 ${className}`}>
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-white space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-white space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border bg-white">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-lg border bg-white space-y-4">
              <Skeleton className="h-5 w-24" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded border space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="border rounded-lg">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-0">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-white space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default EnhancedLoadingState;
