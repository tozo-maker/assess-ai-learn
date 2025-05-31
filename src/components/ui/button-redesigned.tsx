
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]/20",
        secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-[#2563eb]/20",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-[#2563eb]/20",
        danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] focus-visible:ring-[#ef4444]/20",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ButtonRedesigned = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
ButtonRedesigned.displayName = "ButtonRedesigned"

export { ButtonRedesigned, buttonVariants }
