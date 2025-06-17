
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSGridItem,
  DSSubsectionHeader,
  DSBodyText,
  DSHelpText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { studentService } from '@/services/student-service';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  status = 'neutral'
}) => {
  return (
    <DSCard className="relative overflow-hidden">
      <DSCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-gray-50">
            <div className="text-gray-600">
              {icon}
            </div>
          </div>
          {status !== 'neutral' && (
            <DSStatusBadge variant={status} size="sm">
              {status === 'warning' ? 'Attention' : status === 'danger' ? 'Critical' : 'Good'}
            </DSStatusBadge>
          )}
        </div>
        
        <DSSubsectionHeader className="text-sm font-medium text-gray-600 mb-1">
          {title}
        </DSSubsectionHeader>
        
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {value}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
        
        {description && (
          <DSHelpText className="mt-1">
            {description}
          </DSHelpText>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export const StudentsOverviewMetrics: React.FC = () => {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Calculate metrics
  const totalStudents = students.length;
  
  const studentsWithPerformance = students.filter(student => 
    student.performance && !Array.isArray(student.performance)
  );
  
  const averageScore = studentsWithPerformance.length > 0
    ? Math.round(
        studentsWithPerformance.reduce((sum, student) => {
          const performance = Array.isArray(student.performance) ? null : student.performance;
          return sum + (performance?.average_score || 0);
        }, 0) / studentsWithPerformance.length
      )
    : 0;

  const studentsNeedingAttention = students.filter(student => {
    const performance = Array.isArray(student.performance) ? null : student.performance;
    return performance?.needs_attention;
  }).length;

  const recentAssessments = studentsWithPerformance.reduce((total, student) => {
    const performance = Array.isArray(student.performance) ? null : student.performance;
    return total + (performance?.assessment_count || 0);
  }, 0);

  const getPerformanceStatus = () => {
    if (averageScore >= 85) return 'success';
    if (averageScore >= 70) return 'info';
    if (averageScore >= 60) return 'warning';
    return 'danger';
  };

  const getAttentionStatus = () => {
    if (studentsNeedingAttention === 0) return 'success';
    if (studentsNeedingAttention <= 2) return 'warning';
    return 'danger';
  };

  return (
    <DSContentGrid cols={4} className="mb-8">
      <DSGridItem span={1}>
        <MetricCard
          title="Total Students"
          value={totalStudents}
          description="Active students in your class"
          icon={<Users className="h-5 w-5" />}
          trend={{
            value: "2 new this month",
            isPositive: true
          }}
        />
      </DSGridItem>
      
      <DSGridItem span={1}>
        <MetricCard
          title="Class Average"
          value={`${averageScore}%`}
          description="Overall performance score"
          icon={<TrendingUp className="h-5 w-5" />}
          status={getPerformanceStatus()}
          trend={{
            value: "5% from last month",
            isPositive: averageScore >= 75
          }}
        />
      </DSGridItem>
      
      <DSGridItem span={1}>
        <MetricCard
          title="Need Attention"
          value={studentsNeedingAttention}
          description="Students requiring support"
          icon={<AlertCircle className="h-5 w-5" />}
          status={getAttentionStatus()}
        />
      </DSGridItem>
      
      <DSGridItem span={1}>
        <MetricCard
          title="Total Assessments"
          value={recentAssessments}
          description="Completed this semester"
          icon={<BookOpen className="h-5 w-5" />}
          trend={{
            value: "12 this month",
            isPositive: true
          }}
        />
      </DSGridItem>
    </DSContentGrid>
  );
};

export default StudentsOverviewMetrics;
