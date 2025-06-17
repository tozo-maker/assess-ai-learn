
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { StudentFilterValues } from './StudentFilterTypes';

interface ActiveFilterChipsProps {
  filters: StudentFilterValues;
  onFilterUpdate: (key: keyof StudentFilterValues, value: any) => void;
  hasActiveFilters: boolean;
}

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onFilterUpdate,
  hasActiveFilters
}) => {
  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.search && (
        <Badge variant="outline" className="gap-1">
          Search: "{filters.search}"
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterUpdate('search', '')}
          />
        </Badge>
      )}
      {filters.gradeLevel && (
        <Badge variant="outline" className="gap-1">
          Grade {filters.gradeLevel}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterUpdate('gradeLevel', '')}
          />
        </Badge>
      )}
      {filters.performanceLevel && (
        <Badge variant="outline" className="gap-1">
          {filters.performanceLevel}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterUpdate('performanceLevel', '')}
          />
        </Badge>
      )}
      {filters.needsAttention !== null && (
        <Badge variant="outline" className="gap-1">
          {filters.needsAttention ? 'Needs attention' : 'No attention needed'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterUpdate('needsAttention', null)}
          />
        </Badge>
      )}
      {filters.hasParentContact !== null && (
        <Badge variant="outline" className="gap-1">
          {filters.hasParentContact ? 'Has contact' : 'Missing contact'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterUpdate('hasParentContact', null)}
          />
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilterChips;
