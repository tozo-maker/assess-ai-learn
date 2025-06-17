
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GoalStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const GoalStatusFilter: React.FC<GoalStatusFilterProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Status</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoalStatusFilter;
