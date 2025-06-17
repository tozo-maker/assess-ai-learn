
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ClearFiltersButtonProps {
  onClear: () => void;
  hasActiveFilters: boolean;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({
  onClear,
  hasActiveFilters
}) => {
  if (!hasActiveFilters) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClear}
      className="text-gray-500 hover:text-gray-700"
    >
      <X className="h-4 w-4 mr-1" />
      Clear
    </Button>
  );
};

export default ClearFiltersButton;
