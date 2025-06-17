
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PerformanceConfig } from './StudentPerformanceConfig';

interface StudentCardSelectionProps {
  studentId: string;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  config: PerformanceConfig;
}

const StudentCardSelection: React.FC<StudentCardSelectionProps> = ({
  studentId,
  isSelected,
  onSelect,
  config
}) => {
  return (
    <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(studentId, e.target.checked)}
          className={`h-5 w-5 rounded-md border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
            isSelected 
              ? `${config.color.replace('bg-', 'bg-')} border-transparent text-white` 
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
        {isSelected && (
          <CheckCircle className="absolute top-0 left-0 h-5 w-5 text-white pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default StudentCardSelection;
