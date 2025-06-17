
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

// Design system constants
export const designSystem = {
  colors: {
    primary: {
      border: "border-blue-500"
    }
  }
}

const DSPageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    fullWidth?: boolean
  }
>(({ className, fullWidth, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      fullWidth ? "w-full px-4 sm:px-6 lg:px-8" : "container mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  />
))
DSPageContainer.displayName = "DSPageContainer"

const DSSection = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-12 md:py-16 lg:py-20",
      className
    )}
    {...props}
  />
))
DSSection.displayName = "DSSection"

const DSCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
DSCard.displayName = "DSCard"

const DSCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      className
    )}
    {...props}
  />
))
DSCardHeader.displayName = "DSCardHeader"

const DSCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 pt-0",
      className
    )}
    {...props}
  />
))
DSCardContent.displayName = "DSCardContent"

const DSCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
))
DSCardFooter.displayName = "DSCardFooter"

const DSCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DSCardTitle.displayName = "DSCardTitle"

const DSCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DSCardDescription.displayName = "DSCardDescription"

// Enhanced Button Component with proper asChild handling
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-semantic-primary hover:bg-blue-700 text-white shadow",
        secondary: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm",
        ghost: "hover:bg-gray-100 text-gray-700",
        danger: "bg-semantic-danger hover:bg-red-700 text-white shadow",
        warning: "bg-semantic-warning hover:bg-amber-600 text-white shadow",
        success: "bg-semantic-success hover:bg-green-700 text-white shadow",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface DSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const DSButton = React.forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
DSButton.displayName = "DSButton"

const DSInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean
    helpText?: string
  }
>(({ className, type, error, helpText, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <p className={cn("text-sm mt-1", error ? "text-red-500" : "text-muted-foreground")}>
          {helpText}
        </p>
      )}
    </div>
  )
})
DSInput.displayName = "DSInput"

const DSTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean
    helpText?: string
  }
>(({ className, error, helpText, ...props }, ref) => {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <p className={cn("text-sm mt-1", error ? "text-red-500" : "text-muted-foreground")}>
          {helpText}
        </p>
      )}
    </div>
  )
})
DSTextarea.displayName = "DSTextarea"

const DSFormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
    required?: boolean
  }
>(({ className, label, required, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
  </div>
))
DSFormField.displayName = "DSFormField"

const DSStatusBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, variant = 'neutral', size = 'md', ...props }, ref) => {
  let badgeColorClasses = 'bg-gray-100 text-gray-700';

  switch (variant) {
    case 'success':
      badgeColorClasses = 'bg-green-100 text-green-700';
      break;
    case 'warning':
      badgeColorClasses = 'bg-yellow-100 text-yellow-700';
      break;
    case 'danger':
      badgeColorClasses = 'bg-red-100 text-red-700';
      break;
    case 'info':
      badgeColorClasses = 'bg-blue-100 text-blue-700';
      break;
    case 'neutral':
      badgeColorClasses = 'bg-gray-100 text-gray-700';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }[size];

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeColorClasses,
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});
DSStatusBadge.displayName = "DSStatusBadge";

const DSContentGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: number
  }
>(({ className, cols = 1, ...props }, ref) => {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6"
  }[cols] || "grid-cols-1"

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-6",
        gridColsClass,
        className
      )}
      {...props}
    />
  )
})
DSContentGrid.displayName = "DSContentGrid"

const DSGridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    span?: number
  }
>(({ className, span, ...props }, ref) => {
  const spanClass = span ? {
    1: "",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6"
  }[span] || "" : ""

  return (
    <div
      ref={ref}
      className={cn(
        spanClass,
        className
      )}
      {...props}
    />
  )
})
DSGridItem.displayName = "DSGridItem"

const DSSpacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClass = {
    'xs': "h-1",
    'sm': "h-2", 
    'md': "h-4",
    'lg': "h-6",
    'xl': "h-8",
    '2xl': "h-12",
    '3xl': "h-16"
  }[size]

  return (
    <div
      ref={ref}
      className={cn(
        sizeClass,
        className
      )}
      {...props}
    />
  )
})
DSSpacer.displayName = "DSSpacer"

const DSFlexContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    direction?: 'row' | 'col'
  }
>(({ className, justify, align, gap, direction = 'row', ...props }, ref) => {
  const justifyClass = justify ? {
    'start': "justify-start",
    'end': "justify-end", 
    'center': "justify-center",
    'between': "justify-between",
    'around': "justify-around",
    'evenly': "justify-evenly"
  }[justify] : ""

  const alignClass = align ? {
    'start': "items-start",
    'end': "items-end",
    'center': "items-center", 
    'baseline': "items-baseline",
    'stretch': "items-stretch"
  }[align] : ""

  const gapClass = gap ? {
    'xs': "gap-1",
    'sm': "gap-2",
    'md': "gap-4", 
    'lg': "gap-6",
    'xl': "gap-8"
  }[gap] : ""

  const directionClass = direction === 'col' ? "flex-col" : "flex-row"

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        directionClass,
        justifyClass,
        alignClass,
        gapClass,
        className
      )}
      {...props}
    />
  )
})
DSFlexContainer.displayName = "DSFlexContainer"

const DSPageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-tight",
      className
    )}
    {...props}
  />
))
DSPageTitle.displayName = "DSPageTitle"

const DSSectionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      className
    )}
    {...props}
  />
))
DSSectionHeader.displayName = "DSSectionHeader"

// Add DSSubsectionHeader as an alias for DSSectionHeader
const DSSubsectionHeader = DSSectionHeader;

const DSBodyText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-lg text-muted-foreground",
      className
    )}
    {...props}
  />
))
DSBodyText.displayName = "DSBodyText"

const DSHelpText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
DSHelpText.displayName = "DSHelpText"

export {
  designSystem,
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardFooter,
  DSCardTitle,
  DSCardDescription,
  DSButton,
  DSInput,
  DSTextarea,
  DSFormField,
  DSStatusBadge,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSFlexContainer,
  DSPageTitle,
  DSSectionHeader,
  DSSubsectionHeader,
  DSBodyText,
  DSHelpText
}
