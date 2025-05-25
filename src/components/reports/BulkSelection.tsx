
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface BulkSelectionProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  totalStudents: number;
  selectedCount: number;
}

const BulkSelection: React.FC<BulkSelectionProps> = ({
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  totalStudents,
  selectedCount
}) => {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
      <Checkbox
        checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
        onCheckedChange={onSelectAll}
      />
      <span className="text-sm text-gray-600">
        Select all students ({totalStudents})
      </span>
      {selectedCount > 0 && (
        <Badge variant="secondary" className="ml-auto">
          {selectedCount} selected
        </Badge>
      )}
    </div>
  );
};

export default BulkSelection;
