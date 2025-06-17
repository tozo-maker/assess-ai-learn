
export interface GoalFilters {
  search: string;
  status: string;
  priority: string;
  categories: string[];
  sortBy: string;
}

export interface GoalFiltersProps {
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  onClearFilters: () => void;
}

export const getEmptyGoalFilters = (): GoalFilters => ({
  search: '',
  status: 'all',
  priority: 'all',
  categories: [],
  sortBy: 'created_at'
});

export const hasActiveGoalFilters = (filters: GoalFilters): boolean => {
  return filters.search !== '' || 
         filters.status !== 'all' || 
         filters.priority !== 'all' || 
         filters.categories.length > 0;
};
