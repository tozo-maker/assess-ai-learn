
import * as React from "react"
import { cn } from "@/lib/utils"

// Core Design System Foundation
export const designSystem = {
  // Spacing System (base unit: 4px)
  spacing: {
    xs: "4px",    // 4px
    sm: "8px",    // 8px  
    md: "16px",   // 16px
    lg: "24px",   // 24px
    xl: "32px",   // 32px
    "2xl": "48px", // 48px
    "3xl": "64px"  // 64px
  },
  
  // Color System
  colors: {
    primary: {
      bg: "bg-[#2563eb]",
      text: "text-[#2563eb]",
      border: "border-[#2563eb]",
      hover: "hover:bg-[#1d4ed8]",
      light: "bg-[#dbeafe]",
      ring: "ring-[#2563eb]/20"
    },
    success: {
      bg: "bg-[#10b981]",
      text: "text-[#10b981]",
      border: "border-[#10b981]",
      hover: "hover:bg-[#059669]",
      light: "bg-[#d1fae5]",
      ring: "ring-[#10b981]/20"
    },
    warning: {
      bg: "bg-[#f59e0b]",
      text: "text-[#f59e0b]",
      border: "border-[#f59e0b]",
      hover: "hover:bg-[#d97706]",
      light: "bg-[#fef3c7]",
      ring: "ring-[#f59e0b]/20"
    },
    danger: {
      bg: "bg-[#ef4444]",
      text: "text-[#ef4444]",
      border: "border-[#ef4444]",
      hover: "hover:bg-[#dc2626]",
      light: "bg-[#fee2e2]",
      ring: "ring-[#ef4444]/20"
    },
    info: {
      bg: "bg-[#3b82f6]",
      text: "text-[#3b82f6]",
      border: "border-[#3b82f6]",
      hover: "hover:bg-[#2563eb]",
      light: "bg-[#dbeafe]",
      ring: "ring-[#3b82f6]/20"
    },
    neutral: {
      bg: "bg-[#6b7280]",
      text: "text-[#6b7280]",
      border: "border-[#6b7280]",
      hover: "hover:bg-[#4b5563]",
      light: "bg-[#f3f4f6]",
      ring: "ring-[#6b7280]/20"
    }
  },

  // Transition System
  transitions: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
    slower: "duration-500"
  }
} as const;

// Typography Components
export const DSPageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "text-3xl font-bold text-gray-900 leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
DSPageTitle.displayName = "DSPageTitle"

export const DSSectionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-2xl font-semibold text-gray-800 leading-tight",
      className
    )}
    {...props}
  />
))
DSSectionHeader.displayName = "DSSectionHeader"

export const DSSubsectionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-medium text-gray-700 leading-tight",
      className
    )}
    {...props}
  />
))
DSSubsectionHeader.displayName = "DSSubsectionHeader"

export const DSBodyText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-base text-gray-600 leading-6",
      className
    )}
    {...props}
  />
))
DSBodyText.displayName = "DSBodyText"

export const DSHelpText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-500 leading-5",
      className
    )}
    {...props}
  />
))
DSHelpText.displayName = "DSHelpText"

export const DSCaptionText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-xs text-gray-400 leading-4",
      className
    )}
    {...props}
  />
))
DSCaptionText.displayName = "DSCaptionText"

// Button Component
interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const DSButton = React.forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: `${designSystem.colors.primary.bg} text-white ${designSystem.colors.primary.hover} ${designSystem.colors.primary.ring}`,
      secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 ring-[#2563eb]/20",
      ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 ring-[#2563eb]/20",
      danger: `${designSystem.colors.danger.bg} text-white ${designSystem.colors.danger.hover} ${designSystem.colors.danger.ring}`
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base", 
      lg: "h-12 px-6 text-lg"
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium",
          "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DSButton.displayName = "DSButton"

// Card Components
export const DSCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200",
      "transition-shadow duration-200 hover:shadow-md",
      className
    )}
    {...props}
  />
))
DSCard.displayName = "DSCard"

export const DSCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-b border-gray-200", className)}
    {...props}
  />
))
DSCardHeader.displayName = "DSCardHeader"

export const DSCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-medium text-gray-700 leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DSCardTitle.displayName = "DSCardTitle"

export const DSCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-600 leading-5 mt-2",
      className
    )}
    {...props}
  />
))
DSCardDescription.displayName = "DSCardDescription"

export const DSCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
))
DSCardContent.displayName = "DSCardContent"

export const DSCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-t border-gray-200 bg-gray-50", className)}
    {...props}
  />
))
DSCardFooter.displayName = "DSCardFooter"

// Layout Components
export const DSPageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean }
>(({ className, fullWidth = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      fullWidth ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  />
))
DSPageContainer.displayName = "DSPageContainer"

export const DSSection = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { fullWidth?: boolean }
>(({ className, fullWidth, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("py-12 md:py-16 lg:py-20", className)}
    {...props}
  />
))
DSSection.displayName = "DSSection"

export const DSContentGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { cols?: 1 | 2 | 3 | 4 | 6 | 12 }
>(({ className, cols = 12, ...props }, ref) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
    12: "grid-cols-12"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-6 lg:gap-8 items-stretch",
        gridCols[cols],
        className
      )}
      {...props}
    />
  )
})
DSContentGrid.displayName = "DSContentGrid"

export const DSGridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { span?: 1 | 2 | 3 | 4 | 6 | 12 }
>(({ className, span = 1, ...props }, ref) => {
  const spanCols = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3", 
    4: "col-span-1 md:col-span-2 lg:col-span-4",
    6: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6",
    12: "col-span-full"
  };

  return (
    <div
      ref={ref}
      className={cn(spanCols[span], className)}
      {...props}
    />
  )
})
DSGridItem.displayName = "DSGridItem"

export const DSSpacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' }
>(({ className, size = 'md', ...props }, ref) => {
  const spacerSizes = {
    xs: "h-2",     // 8px
    sm: "h-4",     // 16px  
    md: "h-8",     // 32px
    lg: "h-12",    // 48px
    xl: "h-16",    // 64px
    '2xl': "h-24", // 96px
    '3xl': "h-32"  // 128px
  };

  return (
    <div
      ref={ref}
      className={cn(spacerSizes[size], className)}
      {...props}
    />
  )
})
DSSpacer.displayName = "DSSpacer"

export const DSFlexContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'row' | 'col';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ 
  className, 
  direction = 'row', 
  align = 'start', 
  justify = 'start',
  gap = 'md',
  ...props 
}, ref) => {
  const flexClasses = {
    direction: {
      row: "flex-row",
      col: "flex-col"
    },
    align: {
      start: "items-start",
      center: "items-center", 
      end: "items-end",
      stretch: "items-stretch"
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end", 
      between: "justify-between",
      around: "justify-around"
    },
    gap: {
      xs: "gap-2",
      sm: "gap-3", 
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8"
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        flexClasses.direction[direction],
        flexClasses.align[align],
        flexClasses.justify[justify],
        flexClasses.gap[gap],
        className
      )}
      {...props}
    />
  )
})
DSFlexContainer.displayName = "DSFlexContainer"

// Form Components
export const DSInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean; helpText?: string }
>(({ className, type, error, helpText, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <input
        type={type}
        className={cn(
          "flex h-10 sm:h-12 w-full rounded-md border px-3 py-2 text-base transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? `${designSystem.colors.danger.border} ${designSystem.colors.danger.text} focus-visible:${designSystem.colors.danger.ring}`
            : `border-gray-300 focus-visible:${designSystem.colors.primary.border} focus-visible:${designSystem.colors.primary.ring}`,
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <DSHelpText className={error ? designSystem.colors.danger.text : ""}>
          {helpText}
        </DSHelpText>
      )}
    </div>
  )
})
DSInput.displayName = "DSInput"

export const DSTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean; helpText?: string }
>(({ className, error, helpText, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base transition-colors",
          "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? `${designSystem.colors.danger.border} ${designSystem.colors.danger.text} focus-visible:${designSystem.colors.danger.ring}`
            : `border-gray-300 focus-visible:${designSystem.colors.primary.border} focus-visible:${designSystem.colors.primary.ring}`,
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <DSHelpText className={error ? designSystem.colors.danger.text : ""}>
          {helpText}
        </DSHelpText>
      )}
    </div>
  )
})
DSTextarea.displayName = "DSTextarea"

export const DSLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className={designSystem.colors.danger.text + " ml-1"}>*</span>}
  </label>
))
DSLabel.displayName = "DSLabel"

export const DSFormField: React.FC<{
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}> = ({ label, required, children, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <DSLabel required={required}>{label}</DSLabel>
      {children}
    </div>
  )
}

// Status Badge Component
interface DSStatusBadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const DSStatusBadge: React.FC<DSStatusBadgeProps> = ({
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
