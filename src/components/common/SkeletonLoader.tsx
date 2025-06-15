import React from 'react';
import { useReducedMotion } from '@/utils/accessibility';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion && animation !== 'none';

  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: shouldAnimate ? 'animate-pulse' : '',
    wave: shouldAnimate ? 'animate-shimmer' : '',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
};

// Text skeleton with multiple lines
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  spacing = 'normal'
}) => {
  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-3'
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

// Avatar skeleton
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

// Card skeleton
interface SkeletonCardProps {
  hasAvatar?: boolean;
  hasImage?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasAvatar = false,
  hasImage = false,
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`p-6 border border-gray-200 rounded-lg ${className}`} aria-hidden="true">
      {hasImage && (
        <Skeleton variant="rectangular" height={200} className="mb-4" />
      )}
      
      <div className="flex items-start space-x-4">
        {hasAvatar && <SkeletonAvatar />}
        
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" height={20} width="60%" />
          <SkeletonText lines={lines} />
          
          <div className="flex space-x-2 pt-2">
            <Skeleton variant="rounded" height={32} width={80} />
            <Skeleton variant="rounded" height={32} width={60} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Table skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = ''
}) => {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`} aria-hidden="true">
      {hasHeader && (
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }, (_, index) => (
              <Skeleton key={index} variant="text" height={16} width={100} />
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  {colIndex === 0 ? (
                    <div className="flex items-center space-x-3">
                      <SkeletonAvatar size="sm" />
                      <Skeleton variant="text" height={16} width="70%" />
                    </div>
                  ) : (
                    <Skeleton variant="text" height={16} width="80%" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard skeleton
interface SkeletonDashboardProps {
  className?: string;
}

export const SkeletonDashboard: React.FC<SkeletonDashboardProps> = ({
  className = ''
}) => {
  return (
    <div className={`space-y-8 ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton variant="text" height={32} width="40%" />
        <Skeleton variant="text" height={16} width="60%" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="text" height={16} width="60%" />
              <Skeleton variant="rectangular" height={24} width={24} />
            </div>
            <Skeleton variant="text" height={32} width="40%" />
            <Skeleton variant="text" height={12} width="80%" className="mt-2" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <Skeleton variant="text" height={20} width="40%" />
              <Skeleton variant="rounded" height={32} width={100} />
            </div>
            <Skeleton variant="rectangular" height={300} />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton variant="text" height={24} width="30%" className="mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <SkeletonCard key={index} hasAvatar lines={2} />
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <Skeleton variant="text" height={20} width="50%" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1">
                    <Skeleton variant="text" height={14} width="70%" />
                    <Skeleton variant="text" height={12} width="50%" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// List skeleton
interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasActions?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  hasAvatar = true,
  hasActions = true,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Skeleton variant="rectangular" height={16} width={16} />
            {hasAvatar && <SkeletonAvatar />}
          </div>
          
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={14} width="40%" />
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <Skeleton variant="text" height={14} width={40} />
              <Skeleton variant="text" height={12} width={30} className="mt-1" />
            </div>
            <Skeleton variant="rounded" height={24} width={60} />
          </div>
          
          {hasActions && (
            <div className="flex space-x-2">
              <Skeleton variant="rectangular" height={32} width={32} />
              <Skeleton variant="rectangular" height={32} width={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Form skeleton
interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  hasSubmit = true,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`} aria-hidden="true">
      <div className="space-y-2">
        <Skeleton variant="text" height={24} width="40%" />
        <Skeleton variant="text" height={16} width="70%" />
      </div>
      
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" height={16} width="25%" />
          <Skeleton variant="rounded" height={40} width="100%" />
        </div>
      ))}
      
      {hasSubmit && (
        <div className="flex space-x-3 pt-4">
          <Skeleton variant="rounded" height={40} width={120} />
          <Skeleton variant="rounded" height={40} width={80} />
        </div>
      )}
    </div>
  );
};

// Loading wrapper component
interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeleton,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  );
}; 