
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapData {
  skill: string;
  students: {
    student_name: string;
    score: number;
    mastery_level: 'Below Basic' | 'Basic' | 'Proficient' | 'Advanced';
  }[];
}

interface ClassPerformanceHeatmapProps {
  data: HeatmapData[];
}

const ClassPerformanceHeatmap: React.FC<ClassPerformanceHeatmapProps> = ({ data }) => {
  const getColorByScore = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    if (score >= 60) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-green-600';
      case 'Proficient': return 'bg-green-400';
      case 'Basic': return 'bg-yellow-400';
      case 'Below Basic': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Performance Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header row with student names */}
            <div className="flex mb-2">
              <div className="w-32 text-sm font-medium p-2">Skills</div>
              {data[0]?.students.map((student, index) => (
                <div key={index} className="w-24 text-xs p-1 text-center font-medium truncate">
                  {student.student_name}
                </div>
              ))}
            </div>
            
            {/* Heat map rows */}
            {data.map((skillData, skillIndex) => (
              <div key={skillIndex} className="flex mb-1">
                <div className="w-32 text-sm p-2 border-r bg-gray-50 font-medium">
                  {skillData.skill}
                </div>
                {skillData.students.map((student, studentIndex) => (
                  <div key={studentIndex} className="w-24 p-1">
                    <div 
                      className={`h-8 rounded text-white text-xs flex items-center justify-center font-medium ${getColorByScore(student.score)}`}
                      title={`${student.student_name}: ${student.score}% (${student.mastery_level})`}
                    >
                      {student.score}%
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {/* Legend */}
            <div className="mt-6 flex items-center space-x-4 text-xs">
              <span className="font-medium">Performance Scale:</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>&lt;60%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <span>60-69%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>70-79%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>80-89%</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>90%+</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassPerformanceHeatmap;
