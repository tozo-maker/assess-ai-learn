import React from 'react';
import { Filter } from 'lucide-react';
import UnifiedFilterSection from '@/components/common/filters/UnifiedFilterSection';
import GoalCategories from './GoalCategories';
import {
  GoalFilters,
  GoalFiltersProps
} from './filters/GoalFilterTypes';

const GoalFiltersComponent: React.FC<GoalFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const filterConfigs = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search goals...'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Paused', value: 'paused' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'High Priority', value: 'High' },
        { label: 'Medium Priority', value: 'Medium' },
        { label: 'Low Priority', value: 'Low' }
      ]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select' as const,
      options: [
        { label: 'Date Created', value: 'created_at' },
        { label: 'Target Date', value: 'target_date' },
        { label: 'Progress', value: 'progress' },
        { label: 'Priority', value: 'priority' },
        { label: 'Title', value: 'title' }
      ]
    }
  ];

  const updateFilter = (key: keyof GoalFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <UnifiedFilterSection
        title="Filters"
        icon={<Filter className="h-5 w-5" />}
        filterConfigs={filterConfigs}
        values={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        layout="card"
      />
      
      {/* Keep the specialized GoalCategories component for now */}
      <div className="mt-4">
        <GoalCategories
          selectedCategories={filters.categories}
          onCategoryChange={(categories) => updateFilter('categories', categories)}
          mode="filter"
        />
      </div>
    </div>
  );
};

export default GoalFiltersComponent;
export type { GoalFilters };
