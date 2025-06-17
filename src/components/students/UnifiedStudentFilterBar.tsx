
import React, { useState } from 'react';
import { Search, Filter, Grid, List, Users, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import { StudentFilterValues } from './filters/StudentFilterTypes';

interface UnifiedStudentFilterBarProps {
  // Filter state
  filters: StudentFilterValues;
  onFiltersChange: (filters: StudentFilterValues) => void;
  
  // View controls
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  
  // Selection controls
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  selectedCount: number;
  
  // Data counts
  totalStudents: number;
  filteredCount: number;
}

const UnifiedStudentFilterBar: React.FC<UnifiedStudentFilterBarProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  selectedCount,
  totalStudents,
  filteredCount
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;

  const updateFilter = (key: keyof StudentFilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      gradeLevel: '',
      performanceLevel: '',
      needsAttention: null,
      hasParentContact: null
    });
  };

  const removeFilter = (key: keyof StudentFilterValues) => {
    const newFilters = { ...filters };
    if (key === 'needsAttention' || key === 'hasParentContact') {
      newFilters[key] = null;
    } else {
      newFilters[key] = '';
    }
    onFiltersChange(newFilters);
  };

  const getFilterLabel = (key: keyof StudentFilterValues, value: any): string | null => {
    if (!value && value !== false) return null;
    
    switch (key) {
      case 'search':
        return `"${value}"`;
      case 'gradeLevel':
        return `Grade ${value}`;
      case 'performanceLevel':
        return value;
      case 'needsAttention':
        return value ? 'Needs Attention' : 'No Attention Needed';
      case 'hasParentContact':
        return value ? 'Has Parent Contact' : 'No Parent Contact';
      default:
        return String(value);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Main Filter Bar */}
      <div className="p-4 space-y-4">
        {/* Top Row: Search, Quick Filters, View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name, ID, or grade..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Advanced Filters Toggle */}
            <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-md p-1 bg-gray-50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Selection, Results, Clear */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Selection Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                ref={(checkbox) => {
                  if (checkbox) {
                    (checkbox as any).indeterminate = isIndeterminate;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-gray-700 font-medium">
                Select All
              </span>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
          </div>

          {/* Results Count & Clear */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                Showing {filteredCount} of {totalStudents} students
              </span>
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {Object.entries(filters).map(([key, value]) => {
              const label = getFilterLabel(key as keyof StudentFilterValues, value);
              if (!label) return null;
              
              return (
                <Badge key={key} variant="outline" className="gap-1 px-2 py-1">
                  {label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeFilter(key as keyof StudentFilterValues)}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Filter Section */}
      <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
        <CollapsibleContent>
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Grade Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Grade Level</label>
                <Select value={filters.gradeLevel || 'all'} onValueChange={(value) => 
                  updateFilter('gradeLevel', value === 'all' ? '' : value)
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All grades</SelectItem>
                    {gradeLevelOptions.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Performance Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Performance Level</label>
                <Select value={filters.performanceLevel || 'all'} onValueChange={(value) => 
                  updateFilter('performanceLevel', value === 'all' ? '' : value)
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {performanceLevelOptions.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Needs Attention */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Needs Attention</label>
                <Select value={filters.needsAttention === null ? 'all' : filters.needsAttention.toString()} 
                        onValueChange={(value) => 
                  updateFilter('needsAttention', value === 'all' ? null : value === 'true')
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students</SelectItem>
                    <SelectItem value="true">Needs attention</SelectItem>
                    <SelectItem value="false">No attention needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Has Parent Contact */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Parent Contact</label>
                <Select value={filters.hasParentContact === null ? 'all' : filters.hasParentContact.toString()} 
                        onValueChange={(value) => 
                  updateFilter('hasParentContact', value === 'all' ? null : value === 'true')
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students</SelectItem>
                    <SelectItem value="true">Has contact info</SelectItem>
                    <SelectItem value="false">No contact info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default UnifiedStudentFilterBar;
