
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import UnifiedFilterSection from '@/components/common/filters/UnifiedFilterSection';
import { getEmptyFilters } from '@/components/common/filters/UnifiedFilterTypes';
import { gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import {
  StudentFilterValues,
  StudentFiltersProps
} from './filters/StudentFilterTypes';

const StudentFilters: React.FC<StudentFiltersProps> = ({
  onFiltersChange,
  totalStudents,
  filteredCount
}) => {
  const filterConfigs = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search students by name, ID, or grade...'
    },
    {
      key: 'gradeLevel',
      label: 'Grade Level',
      type: 'select' as const,
      options: gradeLevelOptions.map(grade => ({
        label: `Grade ${grade}`,
        value: grade
      }))
    },
    {
      key: 'performanceLevel',
      label: 'Performance Level',
      type: 'select' as const,
      options: performanceLevelOptions.map(level => ({
        label: level,
        value: level
      }))
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      type: 'boolean' as const
    },
    {
      key: 'hasParentContact',
      label: 'Has Parent Contact',
      type: 'boolean' as const
    }
  ];

  const [filters, setFilters] = useState<StudentFilterValues>(() => 
    getEmptyFilters(filterConfigs) as StudentFilterValues
  );

  const handleFiltersChange = (newFilters: StudentFilterValues) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = getEmptyFilters(filterConfigs) as StudentFilterValues;
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <UnifiedFilterSection
      title="Filters"
      icon={<Filter className="h-4 w-4" />}
      filterConfigs={filterConfigs}
      values={filters}
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
      layout="inline"
      showResultsCount={true}
      totalCount={totalStudents}
      filteredCount={filteredCount}
      collapsible={true}
      defaultExpanded={false}
    />
  );
};

export default StudentFilters;
export type { StudentFilterValues };
