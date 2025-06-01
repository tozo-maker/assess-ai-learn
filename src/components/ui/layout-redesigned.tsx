import * as React from "react"
import { cn } from "@/lib/utils"

const PageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    fullWidth?: boolean
  }
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
PageContainer.displayName = "PageContainer"

const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    fullWidth?: boolean
  }
>(({ className, fullWidth = false, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "py-12 md:py-16 lg:py-20",
      fullWidth ? "w-full" : "",
      className
    )}
    {...props}
  />
))
Section.displayName = "Section"

const ContentGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: 1 | 2 | 3 | 4 | 6 | 12
  }
>(({ className, cols = 12, ...props }, ref) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
    12: "grid-cols-12"
  }

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
ContentGrid.displayName = "ContentGrid"

const GridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    span?: 1 | 2 | 3 | 4 | 6 | 12
  }
>(({ className, span = 1, ...props }, ref) => {
  const spanCols = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3",
    4: "col-span-1 md:col-span-2 lg:col-span-4",
    6: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6",
    12: "col-span-full"
  }

  return (
    <div
      ref={ref}
      className={cn(spanCols[span], className)}
      {...props}
    />
  )
})
GridItem.displayName = "GridItem"

const Spacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const spacerSizes = {
    xs: "h-2",     // 8px
    sm: "h-4",     // 16px
    md: "h-8",     // 32px
    lg: "h-12",    // 48px
    xl: "h-16",    // 64px
    '2xl': "h-24", // 96px
    '3xl': "h-32"  // 128px
  }

  return (
    <div
      ref={ref}
      className={cn(spacerSizes[size], className)}
      {...props}
    />
  )
})
Spacer.displayName = "Spacer"

const FlexContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'row' | 'col'
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
  }

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
FlexContainer.displayName = "FlexContainer"

export { 
  PageContainer, 
  Section, 
  ContentGrid, 
  GridItem, 
  Spacer, 
  FlexContainer 
}
