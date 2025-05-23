
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Circle } from 'lucide-react';

interface StudentSkillData {
  student_id: string;
  student_name: string;
  skills: {
    skill_name: string;
    mastery_level: 'Not Started' | 'Developing' | 'Approaching' | 'Proficient' | 'Advanced';
    score: number;
    assessments_count: number;
  }[];
}

interface SkillsMasteryGridProps {
  data: StudentSkillData[];
  skills: string[];
}

const SkillsMasteryGrid: React.FC<SkillsMasteryGridProps> = ({ data, skills }) => {
  const getMasteryIcon = (level: string) => {
    switch (level) {
      case 'Advanced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Proficient':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Approaching':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'Developing':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'Not Started':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMasteryBadgeVariant = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'default' as const;
      case 'Proficient':
        return 'secondary' as const;
      case 'Approaching':
        return 'outline' as const;
      case 'Developing':
        return 'destructive' as const;
      case 'Not Started':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Mastery Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Student</th>
                {skills.map((skill, index) => (
                  <th key={index} className="text-center p-2 font-medium min-w-24">
                    <div className="transform -rotate-45 origin-bottom-left text-xs">
                      {skill}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((student, studentIndex) => (
                <tr key={studentIndex} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{student.student_name}</td>
                  {skills.map((skill, skillIndex) => {
                    const skillData = student.skills.find(s => s.skill_name === skill);
                    return (
                      <td key={skillIndex} className="p-2 text-center">
                        {skillData ? (
                          <div className="flex flex-col items-center space-y-1">
                            {getMasteryIcon(skillData.mastery_level)}
                            <Badge
                              variant={getMasteryBadgeVariant(skillData.mastery_level)}
                              className="text-xs px-1 py-0"
                            >
                              {skillData.score}%
                            </Badge>
                          </div>
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Advanced (90%+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Proficient (80-89%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span>Approaching (70-79%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <XCircle className="h-4 w-4 text-orange-500" />
            <span>Developing (60-69%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle className="h-4 w-4 text-gray-400" />
            <span>Not Started (&lt;60%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsMasteryGrid;
