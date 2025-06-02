
import React from 'react';
import { Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DSButton,
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSSpacer
} from '@/components/ui/design-system';
import { Student } from '@/types/student';

interface StudentSelectionCardProps {
  students: Student[];
  selectedStudents: string[];
  onStudentSelection: (studentId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const StudentSelectionCard: React.FC<StudentSelectionCardProps> = ({
  students,
  selectedStudents,
  onStudentSelection,
  onSelectAll,
  onClearSelection
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Students</h3>
      <DSCard>
        <DSCardContent className="p-4">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {students?.map(student => (
              <DSFlexContainer key={student.id} align="center" gap="sm" className="py-2">
                <Checkbox
                  id={student.id}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={(checked) => 
                    onStudentSelection(student.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={student.id}
                  className="flex-1 cursor-pointer text-base text-gray-700"
                >
                  {student.first_name} {student.last_name} ({student.grade_level})
                </label>
              </DSFlexContainer>
            ))}
          </div>
          
          <DSSpacer size="md" />
          
          <DSFlexContainer gap="sm">
            <DSButton 
              variant="secondary" 
              size="sm"
              onClick={onSelectAll}
            >
              Select All
            </DSButton>
            <DSButton 
              variant="secondary" 
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </DSButton>
          </DSFlexContainer>
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default StudentSelectionCard;
