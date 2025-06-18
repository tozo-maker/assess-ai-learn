
import React, { useState } from 'react';
import { Search, Filter, Grid3X3, List, X, ChevronDown } from 'lucide-react';
import { DSCard, DSCardContent, DSInput, DSButton, DSFlexContainer, DSStatusBadge } from '@/components/ui/design-system';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterValues {
  search: string;
  subject: string;
  type: string;
  status: string;
  gradeLevel: string;
}

interface UnifiedAssessmentFilterBarProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  totalCount: number;
  filteredCount: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const UnifiedAssessmentFilterBar: React.FC<UnifiedAssessmentFilterBarProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof FilterValues) => {
    updateFilter(key, '');
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      subject: '',
      type: '',
      status: '',
      gradeLevel: ''
    });
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '');
  const hasActiveFilters = activeFilters.length > 0;

  const subjectOptions = ['Math', 'Science', 'English', 'History', 'Art'];
  const typeOptions = ['Quiz', 'Test', 'Assignment', 'Project', 'Exam'];
  const statusOptions = ['Draft', 'Active', 'Completed'];
  const gradeLevelOptions = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  return (
    <DSCard className="mb-6 border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
      <DSCardContent className="p-6 space-y-4">
        {/* Search and View Controls */}
        <DSFlexContainer direction="row" gap="md" className="flex-col lg:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <DSInput
              placeholder="Search assessments by title, subject, or type..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <DSFlexContainer direction="row" align="center" gap="sm">
            <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
              <CollapsibleTrigger asChild>
                <DSButton 
                  variant="secondary" 
                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
                  {hasActiveFilters && (
                    <DSStatusBadge variant="info" size="sm" className="ml-2">
                      {activeFilters.length}
                    </DSStatusBadge>
                  )}
                </DSButton>
              </CollapsibleTrigger>
            </Collapsible>

            {onViewModeChange && (
              <div className="flex border border-blue-200 rounded-lg overflow-hidden">
                <DSButton
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className={`rounded-none h-10 w-10 p-0 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </DSButton>
                <DSButton
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className={`rounded-none h-10 w-10 p-0 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </DSButton>
              </div>
            )}
          </DSFlexContainer>
        </DSFlexContainer>

        {/* Results Summary */}
        <DSFlexContainer direction="row" justify="between" align="center" className="text-sm text-gray-600">
          <span>
            Showing <span className="font-medium text-blue-600">{filteredCount}</span> of {totalCount} assessments
          </span>
          {hasActiveFilters && (
            <DSButton
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
            >
              Clear all filters
            </DSButton>
          )}
        </DSFlexContainer>

        {/* Expandable Filters */}
        <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-blue-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Select value={filters.subject} onValueChange={(value) => updateFilter('subject', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Grade Level</label>
                <Select value={filters.gradeLevel} onValueChange={(value) => updateFilter('gradeLevel', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevelOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <DSFlexContainer direction="row" gap="sm" className="flex-wrap pt-2 border-t border-blue-100">
            {activeFilters.map(([key, value]) => (
              <DSStatusBadge 
                key={key} 
                variant="info" 
                size="sm"
                className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                {key === 'gradeLevel' ? `Grade ${value}` : value}
                <button
                  onClick={() => clearFilter(key as keyof FilterValues)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </DSStatusBadge>
            ))}
          </DSFlexContainer>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default UnifiedAssessmentFilterBar;
