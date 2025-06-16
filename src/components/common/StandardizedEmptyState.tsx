
import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSButton,
  DSBodyText,
  DSHelpText,
  DSSpacer
} from '@/components/ui/design-system';

interface EmptyStateAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

interface StandardizedEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  suggestions?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StandardizedEmptyState: React.FC<StandardizedEmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
  suggestions = [],
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      spacing: 'space-y-6'
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <DSCard className={className}>
      <DSCardContent className={`text-center ${currentSize.container}`}>
        <div className={currentSize.spacing}>
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`${currentSize.icon} text-gray-400`}>
              {icon}
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <DSBodyText className={`font-semibold text-gray-900 ${currentSize.title} mb-2`}>
              {title}
            </DSBodyText>
            <DSHelpText className="max-w-sm mx-auto">
              {description}
            </DSHelpText>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <DSFlexContainer direction="col" gap="sm" className="max-w-xs mx-auto">
              {actions.map((action, index) => (
                <DSButton
                  key={index}
                  variant={action.variant || 'primary'}
                  onClick={action.action}
                  className="w-full"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DSButton>
              ))}
            </DSFlexContainer>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <DSSpacer size="md" />
              <div className="border-t border-gray-200 pt-4">
                <DSHelpText className="font-medium text-gray-700 mb-2">
                  Here's what you can do:
                </DSHelpText>
                <ul className="text-sm text-gray-600 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default StandardizedEmptyState;
