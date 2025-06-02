
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSBodyText,
  DSSpacer
} from '@/components/ui/design-system';

interface AnalyticsData {
  totalStudents: number;
  totalAssessments: number;
  averagePerformance: number;
  studentsAtRisk: number;
  studentsExcelling: number;
  recentGrowth: number;
  completionRate: number;
  engagementScore: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, className = "" }) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-[#10b981]';
    if (score >= 70) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { color: 'bg-[#d1fae5] text-[#10b981]', label: 'Excellent' };
    if (score >= 70) return { color: 'bg-[#fef3c7] text-[#f59e0b]', label: 'Good' };
    return { color: 'bg-[#fee2e2] text-[#ef4444]', label: 'Needs Attention' };
  };

  const performanceBadge = getPerformanceBadge(data.averagePerformance);

  return (
    <DSCard className={className}>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer justify="between" align="center">
            <DSFlexContainer align="center" gap="sm">
              <TrendingUp className="h-5 w-5 text-[#2563eb]" />
              <span>Class Analytics Overview</span>
            </DSFlexContainer>
            <Badge className={performanceBadge.color}>
              {performanceBadge.label}
            </Badge>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent className="space-y-xl">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="text-center p-md bg-[#dbeafe] rounded-lg">
            <Users className="h-6 w-6 text-[#2563eb] mx-auto mb-sm" />
            <div className="text-2xl font-bold text-[#2563eb]">{data.totalStudents}</div>
            <div className="text-xs text-[#2563eb]">Total Students</div>
          </div>
          
          <div className="text-center p-md bg-[#d1fae5] rounded-lg">
            <BookOpen className="h-6 w-6 text-[#10b981] mx-auto mb-sm" />
            <div className="text-2xl font-bold text-[#10b981]">{data.totalAssessments}</div>
            <div className="text-xs text-[#10b981]">Assessments</div>
          </div>
          
          <div className="text-center p-md bg-[#f3e8ff] rounded-lg">
            <Target className="h-6 w-6 text-[#7c3aed] mx-auto mb-sm" />
            <div className={`text-2xl font-bold ${getPerformanceColor(data.averagePerformance)}`}>
              {data.averagePerformance}%
            </div>
            <div className="text-xs text-[#7c3aed]">Avg Performance</div>
          </div>
          
          <div className="text-center p-md bg-[#fed7aa] rounded-lg">
            <Clock className="h-6 w-6 text-[#ea580c] mx-auto mb-sm" />
            <div className="text-2xl font-bold text-[#ea580c]">{data.completionRate}%</div>
            <div className="text-xs text-[#ea580c]">Completion Rate</div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="p-md border border-gray-200 rounded-lg">
            <DSFlexContainer justify="between" align="center" className="mb-sm">
              <h4 className="font-medium text-gray-900">Students at Risk</h4>
              <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
            </DSFlexContainer>
            <div className="text-2xl font-bold text-[#ef4444] mb-xs">{data.studentsAtRisk}</div>
            <DSBodyText className="text-gray-600 mb-sm">Need immediate attention</DSBodyText>
            <Link to="/app/students">
              <DSButton variant="secondary" size="sm" className="w-full">
                View Details
              </DSButton>
            </Link>
          </div>

          <div className="p-md border border-gray-200 rounded-lg">
            <DSFlexContainer justify="between" align="center" className="mb-sm">
              <h4 className="font-medium text-gray-900">High Performers</h4>
              <CheckCircle className="h-4 w-4 text-[#10b981]" />
            </DSFlexContainer>
            <div className="text-2xl font-bold text-[#10b981] mb-xs">{data.studentsExcelling}</div>
            <DSBodyText className="text-gray-600 mb-sm">Exceeding expectations</DSBodyText>
            <Link to="/app/insights/class">
              <DSButton variant="secondary" size="sm" className="w-full">
                View Insights
              </DSButton>
            </Link>
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="p-md bg-gradient-to-r from-[#dbeafe] to-[#f3e8ff] rounded-lg">
          <DSFlexContainer justify="between" align="center">
            <div>
              <h4 className="font-medium text-gray-900">Recent Growth</h4>
              <DSBodyText className="text-gray-600">Compared to last month</DSBodyText>
            </div>
            <DSFlexContainer align="center" gap="sm">
              {data.recentGrowth > 0 ? (
                <TrendingUp className="h-5 w-5 text-[#10b981]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[#ef4444]" />
              )}
              <span className={`text-lg font-bold ${data.recentGrowth > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {data.recentGrowth > 0 ? '+' : ''}{data.recentGrowth}%
              </span>
            </DSFlexContainer>
          </DSFlexContainer>
        </div>

        {/* Quick Actions */}
        <DSFlexContainer gap="sm">
          <Link to="/app/assessments/add" className="flex-1">
            <DSButton variant="secondary" size="sm" className="w-full">
              Create Assessment
            </DSButton>
          </Link>
          <Link to="/app/insights/class" className="flex-1">
            <DSButton size="sm" className="w-full">
              View All Insights
            </DSButton>
          </Link>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default AnalyticsDashboard;
