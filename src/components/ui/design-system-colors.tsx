
import * as React from "react"
import { cn } from "@/lib/utils"

// Semantic color classes for consistent usage across the app
export const semanticColors = {
  primary: {
    bg: "bg-[#2563eb]",
    text: "text-[#2563eb]",
    border: "border-[#2563eb]",
    hover: "hover:bg-[#1d4ed8]",
    light: "bg-[#dbeafe]"
  },
  success: {
    bg: "bg-[#10b981]",
    text: "text-[#10b981]",
    border: "border-[#10b981]",
    hover: "hover:bg-[#059669]",
    light: "bg-[#d1fae5]"
  },
  warning: {
    bg: "bg-[#f59e0b]",
    text: "text-[#f59e0b]",
    border: "border-[#f59e0b]",
    hover: "hover:bg-[#d97706]",
    light: "bg-[#fef3c7]"
  },
  danger: {
    bg: "bg-[#ef4444]",
    text: "text-[#ef4444]",
    border: "border-[#ef4444]",
    hover: "hover:bg-[#dc2626]",
    light: "bg-[#fee2e2]"
  },
  info: {
    bg: "bg-[#3b82f6]",
    text: "text-[#3b82f6]",
    border: "border-[#3b82f6]",
    hover: "hover:bg-[#2563eb]",
    light: "bg-[#dbeafe]"
  },
  neutral: {
    bg: "bg-[#6b7280]",
    text: "text-[#6b7280]",
    border: "border-[#6b7280]",
    hover: "hover:bg-[#4b5563]",
    light: "bg-[#f3f4f6]"
  }
};

// Chart color palette for consistent data visualization
export const chartColors = {
  primary: ["#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
  success: ["#10b981", "#059669", "#047857", "#065f46"],
  warning: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
  danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  neutral: ["#6b7280", "#4b5563", "#374151", "#1f2937"]
};

interface SemanticColorProps {
  color: keyof typeof semanticColors;
  variant: keyof typeof semanticColors.primary;
  className?: string;
  children: React.ReactNode;
}

export const SemanticColorBox: React.FC<SemanticColorProps> = ({
  color,
  variant,
  className,
  children
}) => {
  const colorClass = semanticColors[color][variant];
  return (
    <div className={cn(colorClass, className)}>
      {children}
    </div>
  );
};
