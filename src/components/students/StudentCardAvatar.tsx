
import React from 'react';
import { PerformanceData, PerformanceConfig } from './StudentPerformanceConfig';

interface StudentCardAvatarProps {
  firstName: string;
  lastName: string;
  performance: PerformanceData;
  config: PerformanceConfig;
}

const StudentCardAvatar: React.FC<StudentCardAvatarProps> = ({
  firstName,
  lastName,
  performance,
  config
}) => {
  return (
    <div className="relative">
      <div className={`w-16 h-16 rounded-full p-1 ${config.color}`}>
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
          <div className="text-lg font-bold text-gray-700">
            {firstName[0]}{lastName[0]}
          </div>
        </div>
      </div>
      
      {/* Performance score overlay */}
      {performance.score && (
        <div className={`absolute -bottom-1 -right-1 ${config.color} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg`}>
          {Math.round(performance.score)}
        </div>
      )}
    </div>
  );
};

export default StudentCardAvatar;
