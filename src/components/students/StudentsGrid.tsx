
import React from 'react';
import { StudentWithPerformance } from '@/types/student';
import EnhancedStudentCardRedesigned from './EnhancedStudentCardRedesigned';

interface StudentsGridProps {
  students: StudentWithPerformance[];
  viewMode: 'list' | 'grid';
  selectedStudents: string[];
  onStudentClick: (studentId: string) => void;
  onSelectStudent: (studentId: string, checked: boolean) => void;
}

const StudentsGrid: React.FC<StudentsGridProps> = ({
  students,
  viewMode,
  selectedStudents,
  onStudentClick,
  onSelectStudent
}) => {
  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-6'
      }
    `}>
      {students.map((student) => (
        <EnhancedStudentCardRedesigned
          key={student.id}
          student={student}
          onStudentClick={onStudentClick}
          onSelect={onSelectStudent}
          isSelected={selectedStudents.includes(student.id)}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default StudentsGrid;
