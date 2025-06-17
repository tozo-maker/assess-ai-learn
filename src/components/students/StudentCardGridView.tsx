
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import { DSCard, DSCardContent, DSFlexContainer } from '@/components/ui/design-system';
import { getPerformanceData, getPerformanceConfig } from './StudentPerformanceConfig';
import StudentCardAvatar from './StudentCardAvatar';
import StudentCardInfo from './StudentCardInfo';
import StudentCardStats from './StudentCardStats';
import StudentCardActions from './StudentCardActions';
import StudentCardSelection from './StudentCardSelection';

interface StudentCardGridViewProps {
  student: StudentWithPerformance;
  onStudentClick: (studentId: string) => void;
  onSelect: (studentId: string, checked: boolean) => void;
  isSelected: boolean;
}

const StudentCardGridView: React.FC<StudentCardGridViewProps> = ({
  student,
  onStudentClick,
  onSelect,
  isSelected
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const performance = getPerformanceData(student);
  const config = getPerformanceConfig(performance);

  return (
    <DSCard 
      className={`
        relative transition-all duration-300 hover:shadow-xl group cursor-pointer
        ${config.borderColor} border-l-4
        ${isSelected ? `ring-4 ${config.ringColor} shadow-lg ${config.bgColor}` : `hover:shadow-lg hover:-translate-y-1 ${config.bgColor}/30`}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onStudentClick(student.id)}
    >
      {/* Selection checkbox */}
      <StudentCardSelection
        studentId={student.id}
        isSelected={isSelected}
        onSelect={onSelect}
        config={config}
      />

      {/* Urgent attention indicator */}
      {performance.needsAttention && (
        <div className="absolute top-4 left-4 z-10">
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
          </div>
        </div>
      )}

      <DSCardContent className="p-6">
        {/* Horizontal Layout */}
        <DSFlexContainer align="start" gap="lg" className="h-full">
          {/* Left: Avatar with Performance Ring */}
          <div className="flex-shrink-0">
            <StudentCardAvatar
              firstName={student.first_name}
              lastName={student.last_name}
              performance={performance}
              config={config}
            />
          </div>

          {/* Right: Student Info */}
          <div className="flex-1 min-w-0">
            <StudentCardInfo
              firstName={student.first_name}
              lastName={student.last_name}
              gradeLevel={student.grade_level}
              studentId={student.student_id}
              config={config}
              score={performance.score}
            />

            {/* Stats Row */}
            <StudentCardStats
              performance={performance}
              parentEmail={student.parent_email}
              parentPhone={student.parent_phone}
            />

            {/* Quick actions */}
            <StudentCardActions
              studentId={student.id}
              onStudentClick={onStudentClick}
              isHovered={isHovered}
            />
          </div>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default StudentCardGridView;
