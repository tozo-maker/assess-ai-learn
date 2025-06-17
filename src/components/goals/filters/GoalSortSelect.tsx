
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GoalSortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const GoalSortSelect: React.FC<GoalSortSelectProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Sort By</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Date Created</SelectItem>
          <SelectItem value="target_date">Target Date</SelectItem>
          <SelectItem value="progress">Progress</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoalSortSelect;
