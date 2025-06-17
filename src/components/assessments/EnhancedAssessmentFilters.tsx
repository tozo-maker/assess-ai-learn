
import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { assessmentTypeOptions } from '@/types/assessment';

interface FilterValues {
  search: string;
  subject: string;
  type: string;
  status: string;
  gradeLevel: string;
}

interface EnhancedAssessmentFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  totalCount: number;
  filteredCount: number;
}

const EnhancedAssessmentFilters: React.FC<EnhancedAssessmentFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
  const statuses = ['Draft', 'Active', 'Completed'];
  const gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      subject: '',
      type: '',
      status: '',
      gradeLevel: ''
    });
    setIsAdvancedOpen(false);
  };

  const removeFilter = (key: keyof FilterValues) => {
    updateFilter(key, '');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  const getFilterLabel = (key: keyof FilterValues, value: string): string | null => {
    if (!value) return null;
    
    switch (key) {
      case 'search':
        return `Search: "${value}"`;
      case 'subject':
        return `Subject: ${value}`;
      case 'type':
        return `Type: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
      case 'status':
        return `Status: ${value}`;
      case 'gradeLevel':
        return `Grade: ${value}`;
      default:
        return value;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Main Filter Bar */}
      <div className="p-6">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assessments by title, subject, or type..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 border-gray-300 hover:bg-gray-50">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
            <span className="font-medium text-gray-900">{totalCount}</span> assessments
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {Object.entries(filters).map(([key, value]) => {
              const label = getFilterLabel(key as keyof FilterValues, value);
              if (!label) return null;
              
              return (
                <Badge 
                  key={key} 
                  variant="outline" 
                  className="gap-1 px-3 py-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  {label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-blue-900" 
                    onClick={() => removeFilter(key as keyof FilterValues)}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent>
          <div className="border-t border-gray-200 bg-gray-50/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Select value={filters.subject || 'all'} onValueChange={(value) => 
                  updateFilter('subject', value === 'all' ? '' : value)
                }>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assessment Type</label>
                <Select value={filters.type || 'all'} onValueChange={(value) => 
                  updateFilter('type', value === 'all' ? '' : value)
                }>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {assessmentTypeOptions.filter(type => type && type.trim() !== '').map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={filters.status || 'all'} onValueChange={(value) => 
                  updateFilter('status', value === 'all' ? '' : value)
                }>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grade Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Grade Level</label>
                <Select value={filters.gradeLevel || 'all'} onValueChange={(value) => 
                  updateFilter('gradeLevel', value === 'all' ? '' : value)
                }>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All grades</SelectItem>
                    {gradeLevels.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
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

export default EnhancedAssessmentFilters;
