
import * as React from "react"
import { cn } from "@/lib/utils"

const CardRedesigned = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md",
      className
    )}
    {...props}
  />
))
CardRedesigned.displayName = "CardRedesigned"

const CardHeaderRedesigned = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-b border-gray-200", className)}
    {...props}
  />
))
CardHeaderRedesigned.displayName = "CardHeaderRedesigned"

const CardTitleRedesigned = React.forwardRef<
  HTMLParagraphElement,
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
CardTitleRedesigned.displayName = "CardTitleRedesigned"

const CardDescriptionRedesigned = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 mt-1", className)}
    {...props}
  />
))
CardDescriptionRedesigned.displayName = "CardDescriptionRedesigned"

const CardContentRedesigned = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
))
CardContentRedesigned.displayName = "CardContentRedesigned"

const CardFooterRedesigned = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-t border-gray-200 bg-gray-50", className)}
    {...props}
  />
))
CardFooterRedesigned.displayName = "CardFooterRedesigned"

export { 
  CardRedesigned, 
  CardHeaderRedesigned, 
  CardFooterRedesigned, 
  CardTitleRedesigned, 
  CardDescriptionRedesigned, 
  CardContentRedesigned 
}
