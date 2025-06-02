
import * as React from "react"
import { cn } from "@/lib/utils"

// Standard transition durations from design system
export const transitionDurations = {
  fast: "duration-150",
  normal: "duration-200", 
  slow: "duration-300",
  slower: "duration-500"
} as const;

// Standard easing curves
export const easingCurves = {
  standard: "ease-out",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  decelerated: "cubic-bezier(0, 0, 0.2, 1)",
  accelerated: "cubic-bezier(0.4, 0, 1, 1)"
} as const;

interface TransitionProps {
  duration?: keyof typeof transitionDurations;
  easing?: keyof typeof easingCurves;
  properties?: string[];
  className?: string;
  children: React.ReactNode;
}

export const TransitionContainer: React.FC<TransitionProps> = ({
  duration = "normal",
  easing = "standard",
  properties = ["all"],
  className,
  children
}) => {
  const transitionClass = `transition-${properties.join('-')} ${transitionDurations[duration]} ${easingCurves[easing]}`;
  
  return (
    <div className={cn(transitionClass, className)}>
      {children}
    </div>
  );
};

// Preset transition classes for common use cases
export const transitionClasses = {
  // Hover effects
  hover: "transition-colors duration-200 ease-out hover:bg-gray-50",
  hoverPrimary: "transition-colors duration-200 ease-out hover:bg-[#1d4ed8]",
  hoverSecondary: "transition-colors duration-200 ease-out hover:bg-gray-100",
  
  // Scale effects
  scale: "transition-transform duration-200 ease-out hover:scale-105",
  scaleDown: "transition-transform duration-200 ease-out hover:scale-95",
  
  // Opacity effects
  fade: "transition-opacity duration-300 ease-out",
  fadeIn: "transition-opacity duration-300 ease-out opacity-0 hover:opacity-100",
  
  // Combined effects
  lift: "transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-1",
  press: "transition-transform duration-150 ease-out active:scale-95"
} as const;

// Hook for applying consistent transitions
export const useTransition = (type: keyof typeof transitionClasses) => {
  return transitionClasses[type];
};
