
import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
  DSButton,
  DSCard,
  DSCardContent,
  DSBodyText,
  DSHelpText,
  DSFlexContainer,
  designSystem
} from '@/components/ui/design-system';
import { cn } from '@/lib/utils';

interface ContextualHelpTooltipProps {
  title: string;
  content: string;
  steps?: string[];
  link?: {
    text: string;
    url: string;
  };
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ContextualHelpTooltip: React.FC<ContextualHelpTooltipProps> = ({
  title,
  content,
  steps = [],
  link,
  position = 'top',
  size = 'md',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeStyles = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  const positionStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Help trigger button */}
      <DSButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
        aria-label="Show help"
      >
        <HelpCircle className="h-4 w-4" />
      </DSButton>

      {/* Help tooltip */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip content */}
          <div className={cn(
            "absolute z-50",
            sizeStyles[size],
            positionStyles[position]
          )}>
            <DSCard className="shadow-lg border-gray-200">
              <DSCardContent className="p-4">
                <DSFlexContainer justify="between" align="start" className="mb-3">
                  <DSBodyText className="font-semibold text-gray-900 pr-2">
                    {title}
                  </DSBodyText>
                  <DSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </DSButton>
                </DSFlexContainer>
                
                <DSHelpText className="mb-3">
                  {content}
                </DSHelpText>
                
                {steps.length > 0 && (
                  <div className="mb-3">
                    <DSBodyText className="font-medium text-gray-800 mb-2 text-sm">
                      Steps:
                    </DSBodyText>
                    <ol className="space-y-1">
                      {steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className={cn(
                            "flex-shrink-0 w-5 h-5 rounded-full text-xs font-medium",
                            "flex items-center justify-center mr-2 mt-0.5",
                            designSystem.colors.primary.bg,
                            "text-white"
                          )}>
                            {index + 1}
                          </span>
                          <DSHelpText className="flex-1">
                            {step}
                          </DSHelpText>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {link && (
                  <div className="pt-3 border-t border-gray-200">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "text-sm font-medium",
                        designSystem.colors.primary.text,
                        "hover:underline"
                      )}
                    >
                      {link.text} →
                    </a>
                  </div>
                )}
              </DSCardContent>
            </DSCard>
            
            {/* Tooltip arrow */}
            <div className={cn(
              "absolute w-3 h-3 bg-white border-gray-200 rotate-45",
              position === 'top' && "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-b border-r",
              position === 'bottom' && "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-t border-l",
              position === 'left' && "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-t border-r",
              position === 'right' && "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2 border-b border-l"
            )} />
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualHelpTooltip;
