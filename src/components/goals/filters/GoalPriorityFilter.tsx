
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
  // Ensure we have a valid value, default to "all" if empty
  const safeValue = value || "all";

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Priority</Label>
      <Select value={safeValue} onValueChange={(newValue) => onChange(newValue === "all" ? "" : newValue)}>
        <SelectTrigger>
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High Priority</SelectItem>
          <SelectItem value="medium">Medium Priority</SelectItem>
          <SelectItem value="low">Low Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoalPriorityFilter;
