
import React from 'react';
import { AlertCircle, Mail, Phone, Eye, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  DSCard,
  DSCardContent,
  DSButton,
  DSSubsectionHeader,
  DSBodyText,
  DSHelpText,
  DSFlexContainer,
  DSStatusBadge
} from '@/components/ui/design-system';

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
        return 'success';
      case 'Below Average':
        return 'danger';
      case 'Average':
        return 'info';
      default:
        return 'neutral';
    }
  };

  if (viewMode === 'grid') {
    return (
      <DSCard className={`transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-[#2563eb] shadow-lg' : ''}`}>
        <DSCardContent className="p-6">
          <div className="space-y-4">
            {/* Header with checkbox and actions */}
            <DSFlexContainer justify="between" align="center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(student.id, e.target.checked)}
                className="h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DSButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </DSButton>
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
            </DSFlexContainer>

            {/* Avatar and attention indicator */}
            <DSFlexContainer justify="center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xl font-semibold text-blue-600 shadow-sm">
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                {getNeedsAttention() && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                    <AlertCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </DSFlexContainer>

            {/* Student name and grade */}
            <div className="text-center space-y-3">
              <DSSubsectionHeader 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#2563eb] transition-colors line-clamp-2"
                onClick={() => onStudentClick(student.id)}
              >
                {student.first_name} {student.last_name}
              </DSSubsectionHeader>
              <Badge className={`text-xs font-medium ${getGradeLevelColor(student.grade_level)}`}>
                Grade {student.grade_level}
              </Badge>
            </div>

            {/* Student ID */}
            {student.student_id && (
              <DSHelpText className="text-center">ID: {student.student_id}</DSHelpText>
            )}

            {/* Performance summary */}
            <DSFlexContainer direction="col" align="center" gap="sm">
              <DSStatusBadge variant={getPerformanceBadgeVariant(getPerformanceLevel())}>
                {getPerformanceLevel() || "Not assessed"}
              </DSStatusBadge>
              
              {getAverageScore() && (
                <DSFlexContainer align="center" gap="xs" className="text-sm">
                  <DSBodyText className="text-gray-600">Avg:</DSBodyText>
                  <span className="font-medium">{Math.round(getAverageScore()!)}%</span>
                  {getAverageScore()! >= 80 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </DSFlexContainer>
              )}
            </DSFlexContainer>

            {/* Contact info indicators */}
            <DSFlexContainer justify="center" gap="md" className="text-sm text-gray-500">
              {student.parent_email && (
                <DSFlexContainer align="center" gap="xs">
                  <Mail className="h-3 w-3" />
                </DSFlexContainer>
              )}
              {student.parent_phone && (
                <DSFlexContainer align="center" gap="xs">
                  <Phone className="h-3 w-3" />
                </DSFlexContainer>
              )}
            </DSFlexContainer>

            {/* Assessment stats */}
            <div className="pt-4 border-t border-gray-100">
              <DSFlexContainer justify="between" className="text-sm">
                <div className="text-center">
                  <DSHelpText>Assessments</DSHelpText>
                  <DSBodyText className="font-medium">{getAssessmentCount()}</DSBodyText>
                </div>
                {getLastAssessmentDate() && (
                  <div className="text-center">
                    <DSHelpText>Last</DSHelpText>
                    <DSBodyText className="font-medium text-xs">
                      {new Date(getLastAssessmentDate()!).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </DSBodyText>
                  </div>
                )}
              </DSFlexContainer>
            </div>
          </div>
        </DSCardContent>
      </DSCard>
    );
  }

  return (
    <DSCard className={`transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-[#2563eb] shadow-lg' : ''}`}>
      <DSCardContent className="p-6">
        <DSFlexContainer align="start" justify="between">
          {/* Student Info Section */}
          <DSFlexContainer align="start" gap="md" className="flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(student.id, e.target.checked)}
              className="mt-2 h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
            />
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600 shadow-sm">
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
              <DSFlexContainer align="center" gap="md" className="mb-2">
                <DSSubsectionHeader 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#2563eb] transition-colors"
                  onClick={() => onStudentClick(student.id)}
                >
                  {student.first_name} {student.last_name}
                </DSSubsectionHeader>
                <Badge className={`text-xs font-medium ${getGradeLevelColor(student.grade_level)}`}>
                  Grade {student.grade_level}
                </Badge>
              </DSFlexContainer>
              
              {student.student_id && (
                <DSHelpText className="mb-2">ID: {student.student_id}</DSHelpText>
              )}

              {/* Contact Info */}
              <DSFlexContainer align="center" gap="lg" className="text-sm text-gray-500 mb-3">
                {student.parent_email && (
                  <DSFlexContainer align="center" gap="xs">
                    <Mail className="h-3 w-3" />
                    <span>Parent contact</span>
                  </DSFlexContainer>
                )}
                {student.parent_phone && (
                  <DSFlexContainer align="center" gap="xs">
                    <Phone className="h-3 w-3" />
                    <span>Phone on file</span>
                  </DSFlexContainer>
                )}
              </DSFlexContainer>

              {/* Performance Summary */}
              <DSFlexContainer align="center" gap="md">
                <DSStatusBadge variant={getPerformanceBadgeVariant(getPerformanceLevel())}>
                  {getPerformanceLevel() || "Not assessed"}
                </DSStatusBadge>
                
                {getAverageScore() && (
                  <DSFlexContainer align="center" gap="xs" className="text-sm">
                    <DSBodyText className="text-gray-600">Avg:</DSBodyText>
                    <span className="font-medium">{Math.round(getAverageScore()!)}%</span>
                    {getAverageScore()! >= 80 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </DSFlexContainer>
                )}
              </DSFlexContainer>
            </div>
          </DSFlexContainer>

          {/* Assessment Info & Actions */}
          <DSFlexContainer direction="col" align="end" gap="sm">
            <div className="text-right text-sm">
              <DSHelpText>Assessments</DSHelpText>
              <DSBodyText className="font-medium">{getAssessmentCount()}</DSBodyText>
            </div>
            
            {getLastAssessmentDate() && (
              <div className="text-right text-sm">
                <DSHelpText>Last Assessment</DSHelpText>
                <DSBodyText className="font-medium">
                  {new Date(getLastAssessmentDate()!).toLocaleDateString()}
                </DSBodyText>
              </div>
            )}

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DSButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </DSButton>
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
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default EnhancedStudentCard;
