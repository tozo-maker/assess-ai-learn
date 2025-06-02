
import React from 'react';
import { DSCard, DSCardContent, DSBodyText } from '@/components/ui/design-system';

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
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-[#2563eb] mx-auto mb-4`}></div>
        <DSBodyText className="text-gray-600">
          {message}
        </DSBodyText>
      </DSCardContent>
    </DSCard>
  );
};

export default StandardLoadingState;
