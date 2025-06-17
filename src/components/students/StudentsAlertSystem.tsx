import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Eye, Mail, TrendingDown, Clock, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSButton,
  DSSubsectionHeader,
  DSBodyText,
  DSHelpText,
  DSFlexContainer,
  DSStatusBadge
} from '@/components/ui/design-system';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { studentService } from '@/services/student-service';
import { StudentWithPerformance } from '@/types/student';

interface AlertProps {
  student: StudentWithPerformance;
  priority: 'high' | 'medium' | 'low';
  type: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const AlertCard: React.FC<AlertProps> = ({
  student,
  priority,
  type,
  message,
  actionLabel,
  onAction
}) => {
  const priorityConfig = {
    high: { 
      variant: 'danger' as const, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-l-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    medium: { 
      variant: 'warning' as const, 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-l-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    low: { 
      variant: 'info' as const, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-l-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const config = priorityConfig[priority];

  return (
    <DSCard className={`${config.bgColor} ${config.borderColor} border-l-4 transition-all duration-200 hover:shadow-md hover:border-l-6`}>
      <DSCardContent className="p-6">
        <DSFlexContainer justify="between" align="start" className="mb-4">
          <DSFlexContainer align="start" gap="md" className="flex-1">
            {/* Enhanced student avatar with priority indicator */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 shadow-sm border-2 border-white">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className={`absolute -top-1 -right-1 w-5 h-5 ${config.iconBg} rounded-full flex items-center justify-center shadow-sm border border-white`}>
                <AlertCircle className={`h-3 w-3 ${config.iconColor}`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <DSFlexContainer align="center" gap="sm" className="mb-2">
                <DSSubsectionHeader className="text-base font-semibold text-gray-900 truncate">
                  {student.first_name} {student.last_name}
                </DSSubsectionHeader>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Grade {student.grade_level}
                </span>
              </DSFlexContainer>
              
              <DSHelpText className="text-sm font-medium mb-2 text-gray-600">
                {type}
              </DSHelpText>
              
              <DSBodyText className="text-sm text-gray-700 leading-relaxed">
                {message}
              </DSBodyText>
            </div>
          </DSFlexContainer>
          
          <DSFlexContainer direction="col" align="end" gap="sm">
            <DSStatusBadge variant={config.variant} size="sm">
              {priority} priority
            </DSStatusBadge>
            <DSButton 
              variant="ghost" 
              size="sm" 
              onClick={onAction}
              className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
            >
              {actionLabel}
              <ChevronRight className="h-4 w-4 ml-1" />
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export const StudentsAlertSystem: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const generateAlerts = () => {
    const alerts: Array<AlertProps> = [];

    students.forEach(student => {
      const performance = Array.isArray(student.performance) ? null : student.performance;
      
      // High priority: Students needing immediate attention
      if (performance?.needs_attention) {
        alerts.push({
          student,
          priority: 'high',
          type: 'Performance Alert',
          message: `Performance has declined significantly. Average score: ${Math.round(performance.average_score || 0)}%. Immediate intervention recommended.`,
          actionLabel: 'View Profile',
          onAction: () => window.location.href = `/app/students/${student.id}`
        });
      }

      // Medium priority: Low performance
      if (performance && !performance.needs_attention && (performance.average_score || 0) < 70) {
        alerts.push({
          student,
          priority: 'medium',
          type: 'Below Average Performance',
          message: `Current average of ${Math.round(performance.average_score || 0)}% is below class standard. Consider additional support.`,
          actionLabel: 'Contact Parent',
          onAction: () => console.log('Contact parent for', student.id)
        });
      }

      // Low priority: No recent assessments
      if (performance && performance.assessment_count === 0) {
        alerts.push({
          student,
          priority: 'low',
          type: 'Missing Assessment Data',
          message: `No recorded assessments yet. Schedule an evaluation to track progress.`,
          actionLabel: 'Add Assessment',
          onAction: () => window.location.href = `/app/assessments/add`
        });
      }

      // Medium priority: No parent contact info
      if (!student.parent_email && !student.parent_phone) {
        alerts.push({
          student,
          priority: 'medium',
          type: 'Missing Parent Contact',
          message: `No parent contact information on file. Please update student record.`,
          actionLabel: 'Update Info',
          onAction: () => console.log('Update student info for', student.id)
        });
      }
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const alerts = generateAlerts();
  const highPriorityCount = alerts.filter(a => a.priority === 'high').length;
  const mediumPriorityCount = alerts.filter(a => a.priority === 'medium').length;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <DSCard className="mb-8 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <DSCardHeader className="p-6 border-b border-amber-200 bg-white/50">
          <DSFlexContainer align="center" justify="between">
            <DSFlexContainer align="center" gap="sm">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <DSSubsectionHeader className="text-lg font-semibold text-gray-900">
                  Student Alerts
                </DSSubsectionHeader>
                <DSHelpText className="text-sm">
                  {alerts.length} students require attention
                  {highPriorityCount > 0 && (
                    <span className="ml-2 text-red-600 font-medium">
                      • {highPriorityCount} high priority
                    </span>
                  )}
                  {mediumPriorityCount > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">
                      • {mediumPriorityCount} medium priority
                    </span>
                  )}
                </DSHelpText>
              </div>
            </DSFlexContainer>
            
            <div className="flex items-center gap-2">
              <DSButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                View All Alerts
                <ChevronRight className="h-4 w-4 ml-1" />
              </DSButton>
              
              <CollapsibleTrigger asChild>
                <DSButton variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </DSButton>
              </CollapsibleTrigger>
            </div>
          </DSFlexContainer>
        </DSCardHeader>
        
        <CollapsibleContent>
          <DSCardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.slice(0, 5).map((alert, index) => (
                <AlertCard key={`${alert.student.id}-${alert.type}-${index}`} {...alert} />
              ))}
              
              {alerts.length > 5 && (
                <div className="text-center py-4 border-t border-gray-200">
                  <DSButton variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    View {alerts.length - 5} more alerts
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </DSButton>
                </div>
              )}
            </div>
          </DSCardContent>
        </CollapsibleContent>
      </Collapsible>
    </DSCard>
  );
};

export default StudentsAlertSystem;
