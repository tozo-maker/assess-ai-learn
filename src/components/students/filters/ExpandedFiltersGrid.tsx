
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import { StudentFilterValues } from './StudentFilterTypes';

interface ExpandedFiltersGridProps {
  filters: StudentFilterValues;
  onFilterUpdate: (key: keyof StudentFilterValues, value: any) => void;
}

const ExpandedFiltersGrid: React.FC<ExpandedFiltersGridProps> = ({
  filters,
  onFilterUpdate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Grade Level Filter */}
      <div className="space-y-2">
        <Label>Grade Level</Label>
        <Select value={filters.gradeLevel || "all"} onValueChange={(value) => onFilterUpdate('gradeLevel', value)}>
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

      {/* Performance Level Filter */}
      <div className="space-y-2">
        <Label>Performance Level</Label>
        <Select value={filters.performanceLevel || "all"} onValueChange={(value) => onFilterUpdate('performanceLevel', value)}>
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

      {/* Needs Attention Filter */}
      <div className="space-y-2">
        <Label>Attention Required</Label>
        <Select 
          value={filters.needsAttention === null ? "all" : filters.needsAttention.toString()} 
          onValueChange={(value) => onFilterUpdate('needsAttention', value === "all" ? null : value === "true")}
        >
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

      {/* Parent Contact Filter */}
      <div className="space-y-2">
        <Label>Parent Contact</Label>
        <Select 
          value={filters.hasParentContact === null ? "all" : filters.hasParentContact.toString()} 
          onValueChange={(value) => onFilterUpdate('hasParentContact', value === "all" ? null : value === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All students</SelectItem>
            <SelectItem value="true">Has contact info</SelectItem>
            <SelectItem value="false">Missing contact info</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExpandedFiltersGrid;
