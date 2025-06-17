import React, { useState } from 'react';
import { AlertCircle, Mail, Phone, Eye, MoreHorizontal, TrendingUp, TrendingDown, Calendar, BookOpen } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

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
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (gradeLevel.includes('3') || gradeLevel.includes('4') || gradeLevel.includes('5')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (gradeLevel.includes('6') || gradeLevel.includes('7') || gradeLevel.includes('8')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const getPerformanceColor = () => {
    const score = getAverageScore();
    if (!score) return 'bg-gray-400';
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (viewMode === 'grid') {
    return (
      <DSCard 
        className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
          isSelected ? 'ring-2 ring-[#2563eb] shadow-lg bg-blue-50' : 'hover:shadow-lg'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection checkbox - positioned absolutely */}
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(student.id, e.target.checked)}
            className="h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb] bg-white shadow-sm"
          />
        </div>

        {/* Attention indicator */}
        {getNeedsAttention() && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
        )}

        <DSCardContent className="p-6 pt-12">
          <div className="space-y-4">
            {/* Student Avatar and Performance Ring */}
            <DSFlexContainer justify="center" className="relative">
              <div className="relative">
                {/* Performance ring */}
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-r from-gray-200 to-gray-300">
                  <div className={`w-full h-full rounded-full p-1 ${getPerformanceColor()}`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="text-lg font-bold text-gray-700">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Performance score badge */}
                {getAverageScore() && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-1 shadow-lg border">
                    <span className="text-xs font-bold text-gray-700">
                      {Math.round(getAverageScore()!)}%
                    </span>
                  </div>
                )}
              </div>
            </DSFlexContainer>

            {/* Student Info */}
            <div className="text-center space-y-2">
              <DSSubsectionHeader 
                className="text-lg font-bold text-gray-900 cursor-pointer hover:text-[#2563eb] transition-colors leading-tight"
                onClick={() => onStudentClick(student.id)}
              >
                {student.first_name} {student.last_name}
              </DSSubsectionHeader>
              
              <Badge className={`text-xs font-semibold border ${getGradeLevelColor(student.grade_level)}`}>
                Grade {student.grade_level}
              </Badge>
              
              {student.student_id && (
                <DSHelpText className="text-xs">ID: {student.student_id}</DSHelpText>
              )}
            </div>

            {/* Performance Status */}
            <DSFlexContainer justify="center">
              <DSStatusBadge variant={getPerformanceBadgeVariant(getPerformanceLevel())} size="sm">
                {getPerformanceLevel() || "Not assessed"}
              </DSStatusBadge>
            </DSFlexContainer>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
                  <BookOpen className="h-3 w-3 text-gray-400" />
                  <DSHelpText className="text-xs font-medium">Assessments</DSHelpText>
                </DSFlexContainer>
                <DSBodyText className="text-sm font-bold text-gray-900">
                  {getAssessmentCount()}
                </DSBodyText>
              </div>
              
              {getLastAssessmentDate() && (
                <div className="text-center">
                  <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <DSHelpText className="text-xs font-medium">Last</DSHelpText>
                  </DSFlexContainer>
                  <DSBodyText className="text-sm font-bold text-gray-900">
                    {new Date(getLastAssessmentDate()!).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </DSBodyText>
                </div>
              )}
            </div>

            {/* Contact indicators */}
            <DSFlexContainer justify="center" gap="md" className="pt-2">
              {student.parent_email && (
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-3 w-3 text-blue-600" />
                </div>
              )}
              {student.parent_phone && (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="h-3 w-3 text-green-600" />
                </div>
              )}
            </DSFlexContainer>

            {/* Quick actions - shown on hover */}
            <div className={`transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <DSFlexContainer justify="center" gap="sm" className="pt-2">
                <DSButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onStudentClick(student.id)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </DSButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DSButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </DSButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white shadow-lg border">
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Email Parent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DSFlexContainer>
            </div>
          </div>
        </DSCardContent>
      </DSCard>
    );
  }

  // List view (keeping existing implementation but with enhanced styling)
  return (
    <DSCard className={`transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-[#2563eb] shadow-lg bg-blue-50' : ''}`}>
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
