
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssessmentListFiltersProps {
  subjectFilter: string | undefined;
  onSubjectFilterChange: (value: string | undefined) => void;
  typeFilter: string | undefined;
  onTypeFilterChange: (value: string | undefined) => void;
  statusFilter: string | undefined;
  onStatusFilterChange: (value: string | undefined) => void;
}

const AssessmentListFilters: React.FC<AssessmentListFiltersProps> = ({
  subjectFilter,
  onSubjectFilterChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
  const types = ['Quiz', 'Test', 'Project', 'Homework'];
  const statuses = ['Draft', 'Active', 'Completed'];

  return (
    <div className="flex gap-4">
      <Select 
        value={subjectFilter || undefined} 
        onValueChange={(value) => onSubjectFilterChange(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          {subjects.filter(subject => subject && subject.trim() !== '').map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={typeFilter || undefined} 
        onValueChange={(value) => onTypeFilterChange(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {types.filter(type => type && type.trim() !== '').map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={statusFilter || undefined} 
        onValueChange={(value) => onStatusFilterChange(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.filter(status => status && status.trim() !== '').map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssessmentListFilters;
