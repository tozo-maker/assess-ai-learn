
export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'multiselect' | 'toggle' | 'boolean';
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: any;
}

export interface UnifiedFilterValues {
  [key: string]: any;
}

export interface UnifiedFilterProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  filterConfigs: FilterConfig[];
  values: UnifiedFilterValues;
  onFiltersChange: (filters: UnifiedFilterValues) => void;
  onClearFilters: () => void;
  layout?: 'inline' | 'card';
  showResultsCount?: boolean;
  totalCount?: number;
  filteredCount?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const getEmptyFilters = (configs: FilterConfig[]): UnifiedFilterValues => {
  const empty: UnifiedFilterValues = {};
  configs.forEach(config => {
    switch (config.type) {
      case 'search':
        empty[config.key] = '';
        break;
      case 'select':
        empty[config.key] = '';
        break;
      case 'multiselect':
        empty[config.key] = [];
        break;
      case 'boolean':
      case 'toggle':
        empty[config.key] = null;
        break;
      default:
        empty[config.key] = config.defaultValue || '';
    }
  });
  return empty;
};

export const hasActiveFilters = (filters: UnifiedFilterValues): boolean => {
  return Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  });
};

export const getActiveFilterCount = (filters: UnifiedFilterValues): number => {
  return Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};
