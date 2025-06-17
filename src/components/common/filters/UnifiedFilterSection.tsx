
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import {
  FilterSearch,
  FilterSelect,
  FilterMultiSelect,
  FilterBoolean,
  FilterToggleButton,
  FilterClearButton,
  FilterResultsCount
} from './FilterComponents';
import FilterChips from './FilterChips';
import {
  UnifiedFilterProps,
  hasActiveFilters,
  getActiveFilterCount
} from './UnifiedFilterTypes';

const UnifiedFilterSection: React.FC<UnifiedFilterProps> = ({
  title,
  subtitle,
  icon,
  filterConfigs,
  values,
  onFiltersChange,
  onClearFilters,
  layout = 'inline',
  showResultsCount = false,
  totalCount = 0,
  filteredCount = 0,
  collapsible = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const activeFilters = hasActiveFilters(values);
  const activeFilterCount = getActiveFilterCount(values);

  const updateFilter = (key: string, value: any) => {
    // Convert "all" back to empty string for internal logic
    const processedValue = value === "all" ? "" : value;
    const newFilters = { ...values, [key]: processedValue };
    onFiltersChange(newFilters);
  };

  const renderFilter = (config: any) => {
    const commonProps = {
      key: config.key,
      label: config.label,
      value: values[config.key],
      onChange: (value: any) => updateFilter(config.key, value)
    };

    switch (config.type) {
      case 'search':
        return (
          <FilterSearch
            value={values[config.key] || ''}
            onChange={(value) => updateFilter(config.key, value)}
            placeholder={config.placeholder}
          />
        );
      case 'select':
        return (
          <FilterSelect
            {...commonProps}
            options={config.options || []}
            placeholder={config.placeholder}
          />
        );
      case 'multiselect':
        return (
          <FilterMultiSelect
            {...commonProps}
            values={values[config.key] || []}
            onChange={(value) => updateFilter(config.key, value)}
            options={config.options || []}
          />
        );
      case 'boolean':
      case 'toggle':
        return (
          <FilterBoolean
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  if (layout === 'card') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <FilterClearButton 
              hasActiveFilters={activeFilters}
              onClearFilters={onClearFilters}
              variant="badge"
            />
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {filterConfigs.map(renderFilter)}
        </CardContent>
      </Card>
    );
  }

  // Inline layout
  const searchConfig = filterConfigs.find(config => config.type === 'search');
  const otherConfigs = filterConfigs.filter(config => config.type !== 'search');

  return (
    <div className="space-y-4">
      {/* Search - always visible */}
      {searchConfig && renderFilter(searchConfig)}

      {/* Filter Toggle and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {collapsible && (
            <FilterToggleButton
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
              activeFilterCount={activeFilterCount}
              icon={icon}
              label={title}
            />
          )}
          
          <FilterClearButton
            onClear={onClearFilters}
            hasActiveFilters={activeFilters}
            variant="button"
          />
        </div>

        {showResultsCount && (
          <FilterResultsCount
            filteredCount={filteredCount}
            totalCount={totalCount}
            itemName={title.toLowerCase()}
          />
        )}
      </div>

      {/* Expanded Filters */}
      {collapsible ? (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {otherConfigs.map(renderFilter)}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {otherConfigs.map(renderFilter)}
        </div>
      )}

      {/* Active Filter Chips */}
      <FilterChips
        filters={values}
        filterConfigs={filterConfigs}
        onFilterUpdate={updateFilter}
        hasActiveFilters={activeFilters}
      />
    </div>
  );
};

export default UnifiedFilterSection;
