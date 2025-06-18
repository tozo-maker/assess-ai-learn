
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSFlexContainer
} from '@/components/ui/design-system';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Target, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';

interface InsightData {
  type: 'performance' | 'attention' | 'achievement';
  title: string;
  description: string;
  studentCount: number;
  students: StudentWithPerformance[];
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
}

interface InsightsActionPanelProps {
  insights: InsightData[];
  onViewStudents: (students: StudentWithPerformance[]) => void;
  onCreateGoal: (students: StudentWithPerformance[]) => void;
  onScheduleAssessment: (students: StudentWithPerformance[]) => void;
}

const InsightsActionPanel: React.FC<InsightsActionPanelProps> = ({
  insights,
  onViewStudents,
  onCreateGoal,
  onScheduleAssessment
}) => {
  const navigate = useNavigate();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingDown className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <DSCard key={index}>
          <DSCardHeader>
            <DSFlexContainer justify="between" align="center">
              <div>
                <DSCardTitle className="flex items-center gap-2">
                  {getSeverityIcon(insight.severity)}
                  {insight.title}
                </DSCardTitle>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(insight.severity)}>
                  {insight.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {insight.studentCount} student{insight.studentCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            </DSFlexContainer>
          </DSCardHeader>
          <DSCardContent>
            {insight.actionable ? (
              <DSFlexContainer gap="sm" className="flex-wrap">
                <DSButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onViewStudents(insight.students)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Students ({insight.studentCount})
                </DSButton>
                
                <DSButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onCreateGoal(insight.students)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Learning Goal
                </DSButton>
                
                <DSButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onScheduleAssessment(insight.students)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Schedule Assessment
                </DSButton>
                
                <DSButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => navigate('/app/communications/progress-reports')}
                >
                  Generate Reports
                </DSButton>
              </DSFlexContainer>
            ) : (
              <p className="text-sm text-gray-500">
                This insight is for informational purposes. Additional data needed for actionable recommendations.
              </p>
            )}
          </DSCardContent>
        </DSCard>
      ))}
      
      {insights.length === 0 && (
        <DSCard>
          <DSCardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Critical Insights</h3>
            <p className="text-gray-600 mb-4">
              All students are performing well. Continue monitoring their progress.
            </p>
            <DSButton onClick={() => navigate('/app/assessments')}>
              Create New Assessment
            </DSButton>
          </DSCardContent>
        </DSCard>
      )}
    </div>
  );
};

export default InsightsActionPanel;
