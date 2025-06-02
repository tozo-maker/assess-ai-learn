
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText
} from '@/components/ui/design-system';

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
    <DSCard className="border-2 border-dashed border-gray-200">
      <DSCardContent className="p-4">
        <DSFlexContainer align="center" gap="sm">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={onSelectAll}
          />
          <DSBodyText className="flex-1">
            {selectedCount > 0 
              ? `${selectedCount} of ${totalStudents} students selected`
              : `Select all ${totalStudents} students`
            }
          </DSBodyText>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default BulkSelection;
