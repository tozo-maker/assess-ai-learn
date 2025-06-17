
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface FilterToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeFilterCount: number;
}

const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
  isExpanded,
  onToggle,
  activeFilterCount
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      <Filter className="h-4 w-4" />
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
};

export default FilterToggleButton;
