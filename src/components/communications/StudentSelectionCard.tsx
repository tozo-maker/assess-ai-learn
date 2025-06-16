
import React from 'react';
import { Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DSButton,
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSSpacer,
  DSSubsectionHeader
} from '@/components/ui/design-system';
import { Student } from '@/types/student';
import { transitionClasses } from '@/components/ui/transitions';

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
      <DSSubsectionHeader className="mb-md">Select Students</DSSubsectionHeader>
      <DSCard>
        <DSCardContent className="p-md">
          <div className="max-h-60 overflow-y-auto space-y-md">
            {students?.map(student => (
              <DSFlexContainer key={student.id} align="center" gap="sm" className={`py-sm ${transitionClasses.hover} rounded-md px-sm`}>
                <Checkbox
                  id={student.id}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={(checked) => 
                    onStudentSelection(student.id, checked as boolean)
                  }
                  className="transition-colors duration-200"
                />
                <label 
                  htmlFor={student.id}
                  className="flex-1 cursor-pointer text-base text-gray-700 transition-colors duration-200"
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
              className="transition-colors duration-200"
            >
              Select All
            </DSButton>
            <DSButton 
              variant="secondary" 
              size="sm"
              onClick={onClearSelection}
              className="transition-colors duration-200"
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
