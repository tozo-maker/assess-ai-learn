
import * as React from "react"
import { cn } from "@/lib/utils"
import { semanticColors } from "./design-system-colors"
import { transitionClasses } from "./transitions"

// Enhanced spacing utilities following design system
export const spacingSystem = {
  xs: "4px",
  sm: "8px", 
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px"
} as const;

// Status badges with semantic colors
interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  size = 'md',
  children,
  className
}) => {
  const variantStyles = {
    success: `${semanticColors.success.light} ${semanticColors.success.text}`,
    warning: `${semanticColors.warning.light} ${semanticColors.warning.text}`,
    danger: `${semanticColors.danger.light} ${semanticColors.danger.text}`,
    info: `${semanticColors.info.light} ${semanticColors.info.text}`,
    neutral: `${semanticColors.neutral.light} ${semanticColors.neutral.text}`
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm", 
    lg: "px-4 py-2 text-base"
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  );
};

// Metric display component with consistent styling
interface MetricDisplayProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  trend,
  icon,
  variant = 'primary',
  className
}) => {
  const variantColors = {
    primary: semanticColors.primary.text,
    success: semanticColors.success.text,
    warning: semanticColors.warning.text,
    danger: semanticColors.danger.text
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && <div className={variantColors[variant]}>{icon}</div>}
      </div>
      <div className={cn("text-3xl font-bold", variantColors[variant])}>
        {value}
      </div>
      {trend && (
        <div className={cn(
          "text-sm font-medium",
          trend.direction === 'up' && semanticColors.success.text,
          trend.direction === 'down' && semanticColors.danger.text,
          trend.direction === 'neutral' && semanticColors.neutral.text
        )}>
          {trend.value}
        </div>
      )}
    </div>
  );
};

// Interactive card with consistent hover states
interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  href,
  className
}) => {
  const Component = href ? 'a' : 'div';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        transitionClasses.hover,
        onClick || href ? "cursor-pointer hover:shadow-md hover:border-gray-300" : "",
        className
      )}
    >
      {children}
    </Component>
  );
};

export { semanticColors, spacingSystem };
