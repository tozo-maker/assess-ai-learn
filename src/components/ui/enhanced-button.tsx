import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // New semantic variants
        success: "bg-semantic-success text-semantic-success-foreground hover:bg-semantic-success-hover",
        warning: "bg-semantic-warning text-semantic-warning-foreground hover:bg-semantic-warning-hover",
        danger: "bg-semantic-danger text-semantic-danger-foreground hover:bg-semantic-danger-hover",
        info: "bg-semantic-info text-semantic-info-foreground hover:bg-semantic-info-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  shortcut?: string
  tooltip?: string
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    icon,
    shortcut,
    tooltip,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading

    React.useEffect(() => {
      if (!shortcut) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === shortcut.toLowerCase() && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          if (!isDisabled && props.onClick) {
            ;(props.onClick as any)(e)
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [shortcut, isDisabled, props.onClick])

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-label={tooltip}
        title={tooltip}
        data-shortcut={shortcut}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && !loading && icon}
            {children}
          </>
        )}
        {shortcut && (
          <span className="sr-only">
            Keyboard shortcut: {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+{shortcut.toUpperCase()}
          </span>
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }
export type { ButtonProps }