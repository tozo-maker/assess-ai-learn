
export interface StudentFilterValues {
  search: string;
  gradeLevel: string;
  performanceLevel: string;
  needsAttention: boolean | null;
  hasParentContact: boolean | null;
}

export interface StudentFiltersProps {
  values: StudentFilterValues;
  onFiltersChange: (filters: StudentFilterValues) => void;
  totalStudents: number;
  filteredCount: number;
}

export const getEmptyFilters = (): StudentFilterValues => ({
  search: '',
  gradeLevel: '',
  performanceLevel: '',
  needsAttention: null,
  hasParentContact: null
});

export const hasActiveFilters = (filters: StudentFilterValues): boolean => {
  return Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );
};

export const getActiveFilterCount = (filters: StudentFilterValues): number => {
  return Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;
};
