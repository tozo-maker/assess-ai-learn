
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
  DSFlexContainer
} from '@/components/ui/design-system';
import { getPerformanceData, getPerformanceConfig } from './StudentPerformanceConfig';

interface StudentCardListViewProps {
  student: StudentWithPerformance;
  onStudentClick: (studentId: string) => void;
  onSelect: (studentId: string, checked: boolean) => void;
  isSelected: boolean;
}

const StudentCardListView: React.FC<StudentCardListViewProps> = ({
  student,
  onStudentClick,
  onSelect,
  isSelected
}) => {
  const performance = getPerformanceData(student);
  const config = getPerformanceConfig(performance);

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

export default StudentCardListView;
