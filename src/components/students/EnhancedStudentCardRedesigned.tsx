
import React from 'react';
import { StudentWithPerformance } from '@/types/student';
import StudentCardGridView from './StudentCardGridView';
import StudentCardListView from './StudentCardListView';

interface EnhancedStudentCardRedesignedProps {
  student: StudentWithPerformance;
  onStudentClick: (studentId: string) => void;
  onSelect: (studentId: string, checked: boolean) => void;
  isSelected: boolean;
  viewMode?: 'list' | 'grid';
}

const EnhancedStudentCardRedesigned: React.FC<EnhancedStudentCardRedesignedProps> = ({
  student,
  onStudentClick,
  onSelect,
  isSelected,
  viewMode = 'grid'
}) => {
  if (viewMode === 'grid') {
    return (
      <StudentCardGridView
        student={student}
        onStudentClick={onStudentClick}
        onSelect={onSelect}
        isSelected={isSelected}
      />
    );
  }

  return (
    <StudentCardListView
      student={student}
      onStudentClick={onStudentClick}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};

export default EnhancedStudentCardRedesigned;
