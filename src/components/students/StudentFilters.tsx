
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import { gradeLevelOptions, performanceLevelOptions } from '@/types/student';

interface StudentFiltersProps {
  onFiltersChange: (filters: StudentFilterValues) => void;
  totalStudents: number;
  filteredCount: number;
}

export interface StudentFilterValues {
  search: string;
  gradeLevel: string;
  performanceLevel: string;
  needsAttention: boolean | null;
  hasParentContact: boolean | null;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  onFiltersChange,
  totalStudents,
  filteredCount
}) => {
  const [filters, setFilters] = useState<StudentFilterValues>({
    search: '',
    gradeLevel: '',
    performanceLevel: '',
    needsAttention: null,
    hasParentContact: null
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof StudentFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: StudentFilterValues = {
      search: '',
      gradeLevel: '',
      performanceLevel: '',
      needsAttention: null,
      hasParentContact: null
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search students by name, ID, or grade..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredCount} of {totalStudents} students
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Grade Level Filter */}
          <div className="space-y-2">
            <Label>Grade Level</Label>
            <Select value={filters.gradeLevel} onValueChange={(value) => updateFilter('gradeLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All grades</SelectItem>
                {gradeLevelOptions.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Performance Level Filter */}
          <div className="space-y-2">
            <Label>Performance Level</Label>
            <Select value={filters.performanceLevel} onValueChange={(value) => updateFilter('performanceLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All levels</SelectItem>
                {performanceLevelOptions.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Needs Attention Filter */}
          <div className="space-y-2">
            <Label>Attention Required</Label>
            <Select 
              value={filters.needsAttention?.toString() || ""} 
              onValueChange={(value) => updateFilter('needsAttention', value === "" ? null : value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All students</SelectItem>
                <SelectItem value="true">Needs attention</SelectItem>
                <SelectItem value="false">No attention needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parent Contact Filter */}
          <div className="space-y-2">
            <Label>Parent Contact</Label>
            <Select 
              value={filters.hasParentContact?.toString() || ""} 
              onValueChange={(value) => updateFilter('hasParentContact', value === "" ? null : value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All students</SelectItem>
                <SelectItem value="true">Has contact info</SelectItem>
                <SelectItem value="false">Missing contact info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="gap-1">
              Search: "{filters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.gradeLevel && (
            <Badge variant="outline" className="gap-1">
              Grade {filters.gradeLevel}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('gradeLevel', '')}
              />
            </Badge>
          )}
          {filters.performanceLevel && (
            <Badge variant="outline" className="gap-1">
              {filters.performanceLevel}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('performanceLevel', '')}
              />
            </Badge>
          )}
          {filters.needsAttention !== null && (
            <Badge variant="outline" className="gap-1">
              {filters.needsAttention ? 'Needs attention' : 'No attention needed'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('needsAttention', null)}
              />
            </Badge>
          )}
          {filters.hasParentContact !== null && (
            <Badge variant="outline" className="gap-1">
              {filters.hasParentContact ? 'Has contact' : 'Missing contact'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('hasParentContact', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentFilters;
