
import React from 'react';
import { DSCard, DSCardContent, DSBodyText, DSSpacer } from '@/components/ui/design-system';
import { semanticColors } from '@/components/ui/design-system-colors';
import { spacingSystem } from '@/components/ui/design-system-enhanced';

interface StandardLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StandardLoadingState: React.FC<StandardLoadingStateProps> = ({
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerPadding = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <DSCard>
      <DSCardContent className={`text-center ${containerPadding[size]}`}>
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${semanticColors.primary.border} mx-auto`}></div>
        <DSSpacer size="md" />
        <DSBodyText className="text-gray-600">
          {message}
        </DSBodyText>
      </DSCardContent>
    </DSCard>
  );
};

export default StandardLoadingState;
