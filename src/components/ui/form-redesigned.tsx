
import * as React from "react"
import { cn } from "@/lib/utils"

const InputRedesigned = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean
    helpText?: string
  }
>(({ className, type, error, helpText, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <input
        type={type}
        className={cn(
          "flex h-10 sm:h-12 w-full rounded-md border px-3 py-2 text-base transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[#ef4444] text-[#ef4444] focus-visible:ring-[#ef4444]/20"
            : "border-gray-300 focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20",
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <p className={cn(
          "text-sm",
          error ? "text-[#ef4444]" : "text-gray-600"
        )}>
          {helpText}
        </p>
      )}
    </div>
  )
})
InputRedesigned.displayName = "InputRedesigned"

const LabelRedesigned = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean
  }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[#ef4444] ml-1">*</span>}
  </label>
))
LabelRedesigned.displayName = "LabelRedesigned"

const TextareaRedesigned = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean
    helpText?: string
  }
>(({ className, error, helpText, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base transition-colors",
          "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[#ef4444] text-[#ef4444] focus-visible:ring-[#ef4444]/20"
            : "border-gray-300 focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/20",
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <p className={cn(
          "text-sm",
          error ? "text-[#ef4444]" : "text-gray-600"
        )}>
          {helpText}
        </p>
      )}
    </div>
  )
})
TextareaRedesigned.displayName = "TextareaRedesigned"

const FormFieldRedesigned: React.FC<{
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}> = ({ label, required, children, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <LabelRedesigned required={required}>{label}</LabelRedesigned>
      {children}
    </div>
  )
}

export { 
  InputRedesigned, 
  LabelRedesigned, 
  TextareaRedesigned, 
  FormFieldRedesigned 
}
