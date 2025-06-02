
import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  designSystem,
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSBodyText,
  DSHelpText
} from "./design-system"

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
    success: `${designSystem.colors.success.light} ${designSystem.colors.success.text}`,
    warning: `${designSystem.colors.warning.light} ${designSystem.colors.warning.text}`,
    danger: `${designSystem.colors.danger.light} ${designSystem.colors.danger.text}`,
    info: `${designSystem.colors.info.light} ${designSystem.colors.info.text}`,
    neutral: `${designSystem.colors.neutral.light} ${designSystem.colors.neutral.text}`
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
    primary: designSystem.colors.primary.text,
    success: designSystem.colors.success.text,
    warning: designSystem.colors.warning.text,
    danger: designSystem.colors.danger.text
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <DSBodyText className="text-sm font-medium text-gray-600">{label}</DSBodyText>
        {icon && <div className={variantColors[variant]}>{icon}</div>}
      </div>
      <div className={cn("text-3xl font-bold", variantColors[variant])}>
        {value}
      </div>
      {trend && (
        <DSHelpText className={cn(
          "font-medium",
          trend.direction === 'up' && designSystem.colors.success.text,
          trend.direction === 'down' && designSystem.colors.danger.text,
          trend.direction === 'neutral' && designSystem.colors.neutral.text
        )}>
          {trend.value}
        </DSHelpText>
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
        `transition-all ${designSystem.transitions.normal}`,
        onClick || href ? "cursor-pointer hover:shadow-md hover:border-gray-300" : "",
        className
      )}
    >
      {children}
    </Component>
  );
};

// Performance metric card following design system
interface PerformanceCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'primary'
}) => {
  const variantColors = {
    primary: designSystem.colors.primary,
    success: designSystem.colors.success,
    warning: designSystem.colors.warning,
    danger: designSystem.colors.danger
  };

  const colors = variantColors[variant];

  return (
    <DSCard className={`transition-all ${designSystem.transitions.normal} hover:shadow-md`}>
      <DSCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <DSCardTitle className="text-sm text-gray-600 font-medium">
            {title}
          </DSCardTitle>
          {icon && (
            <div className={colors.text}>
              {icon}
            </div>
          )}
        </div>
      </DSCardHeader>
      <DSCardContent>
        <div className={`text-3xl font-bold ${colors.text} mb-2`}>
          {value}
        </div>
        {change && (
          <DSHelpText className={change.isPositive ? designSystem.colors.success.text : designSystem.colors.danger.text}>
            {change.value}
          </DSHelpText>
        )}
      </DSCardContent>
    </DSCard>
  );
};
