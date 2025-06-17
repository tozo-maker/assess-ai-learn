import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Mail, Phone, Eye, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedStudentCardProps {
  student: StudentWithPerformance;
  onStudentClick: (studentId: string) => void;
  onSelect: (studentId: string, checked: boolean) => void;
  isSelected: boolean;
  viewMode?: 'list' | 'grid';
}

const EnhancedStudentCard: React.FC<EnhancedStudentCardProps> = ({
  student,
  onStudentClick,
  onSelect,
  isSelected,
  viewMode = 'list'
}) => {
  const getPerformanceLevel = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return null;
    }
    return student.performance.performance_level;
  };

  const getAverageScore = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return null;
    }
    return student.performance.average_score;
  };

  const getNeedsAttention = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return false;
    }
    return student.performance.needs_attention;
  };

  const getLastAssessmentDate = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return null;
    }
    return student.performance.last_assessment_date;
  };

  const getAssessmentCount = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return 0;
    }
    return student.performance.assessment_count;
  };

  const getGradeLevelColor = (gradeLevel: string) => {
    if (gradeLevel === 'K' || gradeLevel.includes('1') || gradeLevel.includes('2')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (gradeLevel.includes('3') || gradeLevel.includes('4') || gradeLevel.includes('5')) {
      return 'bg-green-100 text-green-800';
    }
    if (gradeLevel.includes('6') || gradeLevel.includes('7') || gradeLevel.includes('8')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-orange-100 text-orange-800';
  };

  const getPerformanceBadgeVariant = (level: string | null) => {
    switch (level) {
      case 'Above Average':
        return 'default';
      case 'Below Average':
        return 'destructive';
      case 'Average':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (viewMode === 'grid') {
    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-[#2563eb]' : ''} h-fit`}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            {/* Header with checkbox and actions */}
            <div className="flex items-center justify-between">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(student.id, e.target.checked)}
                className="h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStudentClick(student.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Parent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatar and attention indicator */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                {getNeedsAttention() && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Student name and grade */}
            <div className="text-center space-y-2">
              <h3 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#2563eb] transition-colors line-clamp-2"
                onClick={() => onStudentClick(student.id)}
              >
                {student.first_name} {student.last_name}
              </h3>
              <Badge className={`text-xs font-medium ${getGradeLevelColor(student.grade_level)}`}>
                Grade {student.grade_level}
              </Badge>
            </div>

            {/* Student ID */}
            {student.student_id && (
              <p className="text-sm text-gray-600 text-center">ID: {student.student_id}</p>
            )}

            {/* Performance summary */}
            <div className="flex flex-col items-center space-y-2">
              <Badge variant={getPerformanceBadgeVariant(getPerformanceLevel())}>
                {getPerformanceLevel() || "Not assessed"}
              </Badge>
              
              {getAverageScore() && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-600">Avg:</span>
                  <span className="font-medium">{Math.round(getAverageScore()!)}%</span>
                  {getAverageScore()! >= 80 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Contact info indicators */}
            <div className="flex justify-center gap-3 text-sm text-gray-500">
              {student.parent_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                </div>
              )}
            </div>

            {/* Assessment stats */}
            <div className="text-center pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-600">Assessments</p>
                  <p className="font-medium">{getAssessmentCount()}</p>
                </div>
                {getLastAssessmentDate() && (
                  <div>
                    <p className="text-gray-600">Last</p>
                    <p className="font-medium text-xs">
                      {new Date(getLastAssessmentDate()!).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-[#2563eb]' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Student Info Section */}
          <div className="flex items-start space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(student.id, e.target.checked)}
              className="mt-2 h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
            />
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              {getNeedsAttention() && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Student Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#2563eb] transition-colors"
                  onClick={() => onStudentClick(student.id)}
                >
                  {student.first_name} {student.last_name}
                </h3>
                <Badge className={`text-xs font-medium ${getGradeLevelColor(student.grade_level)}`}>
                  Grade {student.grade_level}
                </Badge>
              </div>
              
              {student.student_id && (
                <p className="text-sm text-gray-600 mb-2">ID: {student.student_id}</p>
              )}

              {/* Contact Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                {student.parent_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>Parent contact</span>
                  </div>
                )}
                {student.parent_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>Phone on file</span>
                  </div>
                )}
              </div>

              {/* Performance Summary */}
              <div className="flex items-center gap-3">
                <Badge variant={getPerformanceBadgeVariant(getPerformanceLevel())}>
                  {getPerformanceLevel() || "Not assessed"}
                </Badge>
                
                {getAverageScore() && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-600">Avg:</span>
                    <span className="font-medium">{Math.round(getAverageScore()!)}%</span>
                    {getAverageScore()! >= 80 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Info & Actions */}
          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-sm">
              <p className="text-gray-600">Assessments</p>
              <p className="font-medium">{getAssessmentCount()}</p>
            </div>
            
            {getLastAssessmentDate() && (
              <div className="text-sm">
                <p className="text-gray-600">Last Assessment</p>
                <p className="font-medium">
                  {new Date(getLastAssessmentDate()!).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStudentClick(student.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Parent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedStudentCard;
