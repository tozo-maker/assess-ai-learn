
import React, { useState } from 'react';
import { AlertCircle, Mail, Phone, Eye, MoreHorizontal, TrendingUp, TrendingDown, Calendar, BookOpen, CheckCircle } from 'lucide-react';
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
  DSFlexContainer
} from '@/components/ui/design-system';

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
  const [isHovered, setIsHovered] = useState(false);

  const getPerformanceData = () => {
    if (!student.performance || Array.isArray(student.performance)) {
      return {
        level: null,
        score: null,
        needsAttention: false,
        assessmentCount: 0,
        lastAssessment: null
      };
    }
    return {
      level: student.performance.performance_level,
      score: student.performance.average_score,
      needsAttention: student.performance.needs_attention,
      assessmentCount: student.performance.assessment_count,
      lastAssessment: student.performance.last_assessment_date
    };
  };

  const performance = getPerformanceData();

  const getPerformanceConfig = () => {
    if (performance.needsAttention) {
      return {
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-l-red-500',
        textColor: 'text-red-600',
        ringColor: 'ring-red-200',
        status: 'Critical'
      };
    }
    
    if (!performance.score) {
      return {
        color: 'bg-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-l-gray-400',
        textColor: 'text-gray-600',
        ringColor: 'ring-gray-200',
        status: 'Not Assessed'
      };
    }

    if (performance.score >= 85) {
      return {
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-l-green-500',
        textColor: 'text-green-600',
        ringColor: 'ring-green-200',
        status: 'Excellent'
      };
    }
    
    if (performance.score >= 70) {
      return {
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-l-blue-500',
        textColor: 'text-blue-600',
        ringColor: 'ring-blue-200',
        status: 'Good'
      };
    }
    
    if (performance.score >= 60) {
      return {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-l-yellow-500',
        textColor: 'text-yellow-600',
        ringColor: 'ring-yellow-200',
        status: 'Fair'
      };
    }
    
    return {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-l-orange-500',
      textColor: 'text-orange-600',
      ringColor: 'ring-orange-200',
      status: 'Needs Help'
    };
  };

  const config = getPerformanceConfig();

  if (viewMode === 'grid') {
    return (
      <DSCard 
        className={`
          relative min-h-[300px] transition-all duration-300 hover:shadow-xl group cursor-pointer
          ${config.borderColor} border-l-4
          ${isSelected ? `ring-4 ${config.ringColor} shadow-lg ${config.bgColor}` : `hover:shadow-lg hover:-translate-y-1 ${config.bgColor}/30`}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onStudentClick(student.id)}
      >
        {/* Selection checkbox - top right corner */}
        <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(student.id, e.target.checked)}
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

        {/* Urgent attention indicator */}
        {performance.needsAttention && (
          <div className="absolute top-4 left-4 z-10">
            <div className="relative">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
        )}

        <DSCardContent className="p-6 h-full flex flex-col">
          {/* Student Avatar with Performance Ring */}
          <DSFlexContainer justify="center" className="mb-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full p-1 ${config.color}`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-xl font-bold text-gray-700">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                </div>
              </div>
              
              {/* Performance score overlay */}
              {performance.score && (
                <div className={`absolute -bottom-2 -right-2 ${config.color} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg`}>
                  {Math.round(performance.score)}
                </div>
              )}
            </div>
          </DSFlexContainer>

          {/* Student Info */}
          <div className="text-center mb-4 flex-grow">
            <DSSubsectionHeader className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {student.first_name} {student.last_name}
            </DSSubsectionHeader>
            
            <Badge className={`mb-3 ${config.textColor} ${config.bgColor} border-transparent font-semibold`}>
              Grade {student.grade_level}
            </Badge>
            
            {student.student_id && (
              <DSHelpText className="text-xs mb-3">ID: {student.student_id}</DSHelpText>
            )}

            {/* Performance Status - More Prominent */}
            <div className={`mb-4 p-3 rounded-lg ${config.bgColor} border ${config.borderColor.replace('border-l-', 'border-')}`}>
              <DSHelpText className="text-xs font-medium uppercase tracking-wide mb-1">Performance</DSHelpText>
              <div className={`text-lg font-bold ${config.textColor}`}>
                {config.status}
              </div>
              {performance.score && (
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {Math.round(performance.score)}%
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <DSHelpText className="text-xs font-medium">Tests</DSHelpText>
              </DSFlexContainer>
              <DSBodyText className="text-lg font-bold text-gray-900">
                {performance.assessmentCount}
              </DSBodyText>
            </div>
            
            <div className="text-center">
              <DSFlexContainer justify="center" align="center" gap="xs" className="mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <DSHelpText className="text-xs font-medium">Last</DSHelpText>
              </DSFlexContainer>
              <DSBodyText className="text-sm font-bold text-gray-900">
                {performance.lastAssessment 
                  ? new Date(performance.lastAssessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'None'
                }
              </DSBodyText>
            </div>
          </div>

          {/* Contact indicators */}
          <DSFlexContainer justify="center" gap="md" className="mb-4">
            {student.parent_email && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
            )}
            {student.parent_phone && (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
            )}
          </DSFlexContainer>

          {/* Quick actions - Enhanced visibility */}
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'}`}>
            <DSFlexContainer justify="center" gap="sm">
              <DSButton 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onStudentClick(student.id);
                }}
                className="text-xs bg-white shadow-sm hover:shadow-md"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </DSButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DSButton 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-white shadow-sm hover:shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
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
        </DSCardContent>
      </DSCard>
    );
  }

  // Enhanced List view
  return (
    <DSCard className={`
      transition-all duration-200 hover:shadow-lg cursor-pointer
      ${config.borderColor} border-l-4 ${config.bgColor}/30
      ${isSelected ? `ring-2 ${config.ringColor} shadow-lg ${config.bgColor}` : ''}
    `}>
      <DSCardContent className="p-6" onClick={() => onStudentClick(student.id)}>
        <DSFlexContainer align="start" justify="between">
          {/* Student Info Section */}
          <DSFlexContainer align="start" gap="md" className="flex-1">
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(student.id, e.target.checked)}
                className="mt-2 h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
              />
            </div>
            
            {/* Enhanced Avatar */}
            <div className="relative">
              <div className={`w-16 h-16 rounded-full p-1 ${config.color} shadow-lg`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <div className="text-lg font-bold text-gray-700">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                </div>
              </div>
              {performance.needsAttention && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Student Details */}
            <div className="flex-1 min-w-0">
              <DSFlexContainer align="center" gap="md" className="mb-2">
                <DSSubsectionHeader className="text-lg font-semibold text-gray-900">
                  {student.first_name} {student.last_name}
                </DSSubsectionHeader>
                <Badge className={`text-xs font-medium ${config.textColor} ${config.bgColor} border-transparent`}>
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
                    <span>Email</span>
                  </DSFlexContainer>
                )}
                {student.parent_phone && (
                  <DSFlexContainer align="center" gap="xs">
                    <Phone className="h-3 w-3" />
                    <span>Phone</span>
                  </DSFlexContainer>
                )}
              </DSFlexContainer>

              {/* Enhanced Performance Summary */}
              <DSFlexContainer align="center" gap="md">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${config.textColor} ${config.bgColor}`}>
                  {config.status}
                </div>
                
                {performance.score && (
                  <DSFlexContainer align="center" gap="xs" className="text-sm">
                    <DSBodyText className="text-gray-600">Score:</DSBodyText>
                    <span className={`font-bold text-lg ${config.textColor}`}>{Math.round(performance.score)}%</span>
                    {performance.score >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
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
              <DSBodyText className="font-bold text-lg">{performance.assessmentCount}</DSBodyText>
            </div>
            
            {performance.lastAssessment && (
              <div className="text-right text-sm">
                <DSHelpText>Last Assessment</DSHelpText>
                <DSBodyText className="font-medium">
                  {new Date(performance.lastAssessment).toLocaleDateString()}
                </DSBodyText>
              </div>
            )}

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DSButton 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
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

export default EnhancedStudentCardRedesigned;
