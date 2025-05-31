
import * as React from "react"
import { cn } from "@/lib/utils"

const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-3xl font-bold text-gray-900", className)}
    {...props}
  />
))
PageTitle.displayName = "PageTitle"

const SectionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-2xl font-semibold text-gray-800", className)}
    {...props}
  />
))
SectionHeader.displayName = "SectionHeader"

const SubsectionHeader = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-medium text-gray-700", className)}
    {...props}
  />
))
SubsectionHeader.displayName = "SubsectionHeader"

const BodyText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-gray-600", className)}
    {...props}
  />
))
BodyText.displayName = "BodyText"

const HelpText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
HelpText.displayName = "HelpText"

const CaptionText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-gray-400", className)}
    {...props}
  />
))
CaptionText.displayName = "CaptionText"

export { 
  PageTitle, 
  SectionHeader, 
  SubsectionHeader, 
  BodyText, 
  HelpText, 
  CaptionText 
}
