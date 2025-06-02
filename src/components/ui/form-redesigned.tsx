
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DSInput,
  DSTextarea,
  DSLabel,
  DSFormField,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system'

// Re-export design system form components with consistent naming
export const InputRedesigned = DSInput
export const LabelRedesigned = DSLabel
export const TextareaRedesigned = DSTextarea
export const FormFieldRedesigned = DSFormField

// Enhanced Select component that follows design system
interface SelectRedesignedProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helpText?: string;
  options: { value: string; label: string }[];
}

export const SelectRedesigned = React.forwardRef<
  HTMLSelectElement,
  SelectRedesignedProps
>(({ className, error, helpText, options, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <select
        className={cn(
          "flex h-10 sm:h-12 w-full rounded-md border px-3 py-2 text-base transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? `${designSystem.colors.danger.border} ${designSystem.colors.danger.text} focus-visible:${designSystem.colors.danger.ring}`
            : `border-gray-300 focus-visible:${designSystem.colors.primary.border} focus-visible:${designSystem.colors.primary.ring}`,
          className
        )}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && (
        <DSHelpText className={error ? designSystem.colors.danger.text : ""}>
          {helpText}
        </DSHelpText>
      )}
    </div>
  )
})
SelectRedesigned.displayName = "SelectRedesigned"

// Enhanced Checkbox component
interface CheckboxRedesignedProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: boolean;
  helpText?: string;
}

export const CheckboxRedesigned = React.forwardRef<
  HTMLInputElement,
  CheckboxRedesignedProps
>(({ className, label, error, helpText, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border transition-colors",
            "focus:ring-2 focus:ring-offset-0",
            error
              ? `${designSystem.colors.danger.border} ${designSystem.colors.danger.text} focus:${designSystem.colors.danger.ring}`
              : `border-gray-300 ${designSystem.colors.primary.text} focus:${designSystem.colors.primary.ring}`,
            className
          )}
          ref={ref}
          {...props}
        />
        <DSLabel className="font-normal">{label}</DSLabel>
      </div>
      {helpText && (
        <DSHelpText className={error ? designSystem.colors.danger.text : ""}>
          {helpText}
        </DSHelpText>
      )}
    </div>
  )
})
CheckboxRedesigned.displayName = "CheckboxRedesigned"

// Form section wrapper for consistent spacing
export const FormSectionRedesigned: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <DSHelpText>{description}</DSHelpText>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
