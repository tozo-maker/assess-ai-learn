
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GoalPriorityFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const GoalPriorityFilter: React.FC<GoalPriorityFilterProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Priority</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="High">High Priority</SelectItem>
          <SelectItem value="Medium">Medium Priority</SelectItem>
          <SelectItem value="Low">Low Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoalPriorityFilter;
