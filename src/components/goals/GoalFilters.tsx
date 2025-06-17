
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import GoalCategories from './GoalCategories';
import GoalSearchInput from './filters/GoalSearchInput';
import GoalStatusFilter from './filters/GoalStatusFilter';
import GoalPriorityFilter from './filters/GoalPriorityFilter';
import GoalSortSelect from './filters/GoalSortSelect';
import GoalClearFiltersButton from './filters/GoalClearFiltersButton';
import {
  GoalFilters,
  GoalFiltersProps,
  hasActiveGoalFilters
} from './filters/GoalFilterTypes';

const GoalFiltersComponent: React.FC<GoalFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}) => {
  const updateFilter = (key: keyof GoalFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilters = hasActiveGoalFilters(filters);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <GoalClearFiltersButton 
            hasActiveFilters={activeFilters}
            onClearFilters={onClearFilters}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoalSearchInput
          value={filters.search}
          onChange={(value) => updateFilter('search', value)}
        />

        <GoalStatusFilter
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
        />

        <GoalPriorityFilter
          value={filters.priority}
          onChange={(value) => updateFilter('priority', value)}
        />

        <GoalCategories
          selectedCategories={filters.categories}
          onCategoryChange={(categories) => updateFilter('categories', categories)}
          mode="filter"
        />

        <GoalSortSelect
          value={filters.sortBy}
          onChange={(value) => updateFilter('sortBy', value)}
        />
      </CardContent>
    </Card>
  );
};

export default GoalFiltersComponent;
export type { GoalFilters };
