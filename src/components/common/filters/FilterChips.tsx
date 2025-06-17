
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FilterConfig, UnifiedFilterValues } from './UnifiedFilterTypes';

interface FilterChipsProps {
  filters: UnifiedFilterValues;
  filterConfigs: FilterConfig[];
  onFilterUpdate: (key: string, value: any) => void;
  hasActiveFilters: boolean;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  filterConfigs,
  onFilterUpdate,
  hasActiveFilters
}) => {
  if (!hasActiveFilters) return null;

  const getFilterLabel = (config: FilterConfig, value: any): string | null => {
    if (!value) return null;
    
    switch (config.type) {
      case 'search':
        return value ? `Search: "${value}"` : null;
      case 'select':
        const option = config.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      case 'multiselect':
        if (Array.isArray(value) && value.length > 0) {
          const labels = value.map(v => {
            const option = config.options?.find(opt => opt.value === v);
            return option ? option.label : v;
          });
          return labels.join(', ');
        }
        return null;
      case 'boolean':
      case 'toggle':
        if (value === null) return null;
        return value ? config.label : `No ${config.label.toLowerCase()}`;
      default:
        return value ? String(value) : null;
    }
  };

  const clearFilter = (config: FilterConfig) => {
    switch (config.type) {
      case 'multiselect':
        onFilterUpdate(config.key, []);
        break;
      case 'boolean':
      case 'toggle':
        onFilterUpdate(config.key, null);
        break;
      default:
        onFilterUpdate(config.key, '');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filterConfigs.map((config) => {
        const label = getFilterLabel(config, filters[config.key]);
        if (!label) return null;

        return (
          <Badge key={config.key} variant="outline" className="gap-1">
            {label}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => clearFilter(config)}
            />
          </Badge>
        );
      })}
    </div>
  );
};

export default FilterChips;
