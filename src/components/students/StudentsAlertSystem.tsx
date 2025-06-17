
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Eye, Mail, TrendingDown, Clock } from 'lucide-react';
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
    high: { variant: 'danger' as const, bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    medium: { variant: 'warning' as const, bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    low: { variant: 'info' as const, bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
  };

  const config = priorityConfig[priority];

  return (
    <DSCard className={`${config.bgColor} ${config.borderColor} border-l-4`}>
      <DSCardContent className="p-4">
        <DSFlexContainer justify="between" align="start" className="mb-3">
          <div className="flex-1">
            <DSFlexContainer align="center" gap="sm" className="mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div>
                <DSSubsectionHeader className="text-sm font-medium text-gray-900">
                  {student.first_name} {student.last_name}
                </DSSubsectionHeader>
                <DSHelpText>{type}</DSHelpText>
              </div>
            </DSFlexContainer>
            <DSBodyText className="text-sm text-gray-700 mb-3">
              {message}
            </DSBodyText>
          </div>
          <DSStatusBadge variant={config.variant} size="sm">
            {priority} priority
          </DSStatusBadge>
        </DSFlexContainer>
        
        <DSFlexContainer justify="end" gap="sm">
          <DSButton variant="ghost" size="sm" onClick={onAction}>
            {actionLabel}
          </DSButton>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export const StudentsAlertSystem: React.FC = () => {
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
          message: `${student.first_name} is struggling and needs immediate support. Average score: ${Math.round(performance.average_score || 0)}%`,
          actionLabel: 'View Profile',
          onAction: () => window.location.href = `/app/students/${student.id}`
        });
      }

      // Medium priority: Low performance
      if (performance && !performance.needs_attention && (performance.average_score || 0) < 70) {
        alerts.push({
          student,
          priority: 'medium',
          type: 'Low Performance',
          message: `${student.first_name}'s performance is below average. Consider additional support.`,
          actionLabel: 'Contact Parent',
          onAction: () => console.log('Contact parent for', student.id)
        });
      }

      // Low priority: No recent assessments
      if (performance && performance.assessment_count === 0) {
        alerts.push({
          student,
          priority: 'low',
          type: 'No Assessment Data',
          message: `${student.first_name} has no recorded assessments. Schedule an evaluation.`,
          actionLabel: 'Add Assessment',
          onAction: () => window.location.href = `/app/assessments/add`
        });
      }
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const alerts = generateAlerts();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <DSCard className="mb-8">
      <DSCardHeader className="p-6 border-b border-gray-200">
        <DSFlexContainer align="center" gap="sm">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <DSSubsectionHeader>
            Student Alerts ({alerts.length})
          </DSSubsectionHeader>
        </DSFlexContainer>
        <DSHelpText className="mt-1">
          Students requiring your attention based on performance and engagement data
        </DSHelpText>
      </DSCardHeader>
      <DSCardContent className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {alerts.slice(0, 5).map((alert, index) => (
            <AlertCard key={`${alert.student.id}-${index}`} {...alert} />
          ))}
          {alerts.length > 5 && (
            <DSBodyText className="text-center text-gray-500 py-2">
              And {alerts.length - 5} more alerts...
            </DSBodyText>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default StudentsAlertSystem;
