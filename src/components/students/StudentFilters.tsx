
import React, { useState } from 'react';
import StudentSearchInput from './filters/StudentSearchInput';
import FilterToggleButton from './filters/FilterToggleButton';
import ClearFiltersButton from './filters/ClearFiltersButton';
import FilterResultsCount from './filters/FilterResultsCount';
import ExpandedFiltersGrid from './filters/ExpandedFiltersGrid';
import ActiveFilterChips from './filters/ActiveFilterChips';
import {
  StudentFilterValues,
  StudentFiltersProps,
  getEmptyFilters,
  hasActiveFilters,
  getActiveFilterCount
} from './filters/StudentFilterTypes';

const StudentFilters: React.FC<StudentFiltersProps> = ({
  onFiltersChange,
  totalStudents,
  filteredCount
}) => {
  const [filters, setFilters] = useState<StudentFilterValues>(getEmptyFilters());
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof StudentFilterValues, value: any) => {
    // Convert "all" back to empty string for internal logic
    const processedValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: processedValue };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = getEmptyFilters();
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilters = hasActiveFilters(filters);
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <StudentSearchInput
        value={filters.search}
        onChange={(value) => updateFilter('search', value)}
      />

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterToggleButton
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            activeFilterCount={activeFilterCount}
          />
          
          <ClearFiltersButton
            onClear={clearFilters}
            hasActiveFilters={activeFilters}
          />
        </div>

        <FilterResultsCount
          filteredCount={filteredCount}
          totalStudents={totalStudents}
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <ExpandedFiltersGrid
          filters={filters}
          onFilterUpdate={updateFilter}
        />
      )}

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={filters}
        onFilterUpdate={updateFilter}
        hasActiveFilters={activeFilters}
      />
    </div>
  );
};

export default StudentFilters;
export type { StudentFilterValues };
