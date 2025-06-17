import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const DSPageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "container mx-auto px-4 sm:px-6 lg:px-8",
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
  React.HTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
DSInput.displayName = "DSInput"

const DSStatusBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
>(({ className, variant = 'neutral', ...props }, ref) => {
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

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeColorClasses,
        className
      )}
      {...props}
    />
  );
});
DSStatusBadge.displayName = "DSStatusBadge";

const DSContentGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid gap-6",
      className
    )}
    {...props}
  />
))
DSContentGrid.displayName = "DSContentGrid"

const DSGridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "",
      className
    )}
    {...props}
  />
))
DSGridItem.displayName = "DSGridItem"

const DSSpacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "",
      className
    )}
    {...props}
  />
))
DSSpacer.displayName = "DSSpacer"

const DSFlexContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex",
      className
    )}
    {...props}
  />
))
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
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardFooter,
  DSButton,
  DSInput,
  DSStatusBadge,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSFlexContainer,
  DSPageTitle,
  DSSectionHeader,
  DSBodyText,
  DSHelpText
}
