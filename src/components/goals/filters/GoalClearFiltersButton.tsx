
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface GoalClearFiltersButtonProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const GoalClearFiltersButton: React.FC<GoalClearFiltersButtonProps> = ({
  hasActiveFilters,
  onClearFilters
}) => {
  if (!hasActiveFilters) return null;

  return (
    <Badge 
      variant="outline" 
      className="cursor-pointer hover:bg-gray-100"
      onClick={onClearFilters}
    >
      Clear All
    </Badge>
  );
};

export default GoalClearFiltersButton;
