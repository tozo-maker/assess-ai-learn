
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { FilterConfig, FilterOption } from './UnifiedFilterTypes';

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterSearch: React.FC<FilterSearchProps> = ({
  value,
  onChange,
  placeholder = "Search..."
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select..."
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value || "all"} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface FilterMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: FilterOption[];
}

export const FilterMultiSelect: React.FC<FilterMultiSelectProps> = ({
  label,
  values,
  onChange,
  options
}) => {
  const handleToggle = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={values.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <Label htmlFor={option.value} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FilterBooleanProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

export const FilterBoolean: React.FC<FilterBooleanProps> = ({
  label,
  value,
  onChange
}) => {
  const displayValue = value === null ? "all" : value.toString();
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={displayValue} onValueChange={(val) => 
        onChange(val === "all" ? null : val === "true")
      }>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

interface FilterToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeFilterCount: number;
  icon?: React.ReactNode;
  label?: string;
}

export const FilterToggleButton: React.FC<FilterToggleButtonProps> = ({
  isExpanded,
  onToggle,
  activeFilterCount,
  icon = <Filter className="h-4 w-4" />,
  label = "Filters"
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      {icon}
      {label}
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
};

interface FilterClearButtonProps {
  onClear: () => void;
  hasActiveFilters: boolean;
  variant?: 'button' | 'badge';
}

export const FilterClearButton: React.FC<FilterClearButtonProps> = ({
  onClear,
  hasActiveFilters,
  variant = 'button'
}) => {
  if (!hasActiveFilters) return null;

  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline" 
        className="cursor-pointer hover:bg-gray-100"
        onClick={onClear}
      >
        Clear All
      </Badge>
    );
  }

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

interface FilterResultsCountProps {
  filteredCount: number;
  totalCount: number;
  itemName?: string;
}

export const FilterResultsCount: React.FC<FilterResultsCountProps> = ({
  filteredCount,
  totalCount,
  itemName = "items"
}) => {
  return (
    <div className="text-sm text-gray-600">
      Showing {filteredCount} of {totalCount} {itemName}
    </div>
  );
};
