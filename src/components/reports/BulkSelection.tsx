
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
          <div className="relative">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className={isIndeterminate ? "data-[state=checked]:bg-blue-600 bg-blue-600" : ""}
            />
            {isIndeterminate && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-0.5 bg-white rounded"></div>
              </div>
            )}
          </div>
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
