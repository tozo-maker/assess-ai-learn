
import * as React from "react"
import { cn } from "@/lib/utils"

// Core transition classes following design system
export const transitionClasses = {
  // Speed variants
  fast: "transition-all duration-150 ease-out",
  normal: "transition-all duration-200 ease-out", 
  slow: "transition-all duration-300 ease-out",
  slower: "transition-all duration-500 ease-out",
  
  // Specific transition types
  colors: "transition-colors duration-200 ease-out",
  transform: "transition-transform duration-200 ease-out",
  opacity: "transition-opacity duration-200 ease-out",
  shadow: "transition-shadow duration-200 ease-out",
  
  // Interactive states
  hover: "transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg",
  hoverSubtle: "transition-all duration-200 ease-out hover:shadow-md hover:border-gray-300",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
  
  // Micro-interactions
  cardHover: "transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
  buttonPress: "transition-all duration-150 ease-out active:scale-[0.98] active:shadow-inner",
  
  // Loading states
  skeleton: "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
  shimmer: "animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
} as const;

// Enhanced loading component with proper animations
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-muted-foreground',
    white: 'text-white'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton loader for consistent loading states
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  lines = 1 
}) => {
  if (lines === 1) {
    return (
      <div 
        className={cn(
          "h-4 bg-gray-200 rounded animate-pulse",
          className
        )}
        aria-label="Loading content"
      />
    );
  }

  return (
    <div className="space-y-2" aria-label="Loading content">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 rounded animate-pulse",
            i === lines - 1 && "w-3/4", // Last line shorter
            className
          )}
        />
      ))}
    </div>
  );
};

// Staggered animation container for lists
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  delay = 100
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            animationDelay: `${index * delay}ms`
          }}
          className="animate-fade-in"
        >
          {child}
        </div>
      ))}
    </div>
  );
};
