
import React from 'react';
import { Users, FileText, Lightbulb, TrendingUp } from 'lucide-react';
import { 
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSContentGrid
} from '@/components/ui/design-system';

interface StatsData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

interface DashboardStatsRedesignedProps {
  totalStudents: number;
  totalAssessments: number;
  aiInsights: number;
  recentAssessments: number;
  newStudentsThisMonth: number;
  todaysInsights: number;
  studentMetrics?: {
    averagePerformance: string;
  };
}

const DashboardStatsRedesigned: React.FC<DashboardStatsRedesignedProps> = ({
  totalStudents,
  totalAssessments,
  aiInsights,
  recentAssessments,
  newStudentsThisMonth,
  todaysInsights,
  studentMetrics
}) => {
  const stats: StatsData[] = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} this month` : "No new students"
    },
    {
      title: "Assessments",
      value: totalAssessments.toString(),
      icon: <FileText className="h-6 w-6 text-green-600" />,
      trend: recentAssessments > 0 ? `+${recentAssessments} this week` : "No recent assessments"
    },
    {
      title: "AI Insights Generated",
      value: aiInsights.toString(),
      icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
      trend: todaysInsights > 0 ? `+${todaysInsights} today` : "No new insights"
    },
    {
      title: "Avg. Class Performance",
      value: studentMetrics?.averagePerformance || "N/A",
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      trend: studentMetrics?.averagePerformance !== "N/A" ? "Based on latest data" : "No data available"
    }
  ];

  return (
    <DSContentGrid cols={4}>
      {stats.map((stat, index) => (
        <DSCard key={index}>
          <DSCardContent>
            <DSFlexContainer justify="between" align="center">
              <div>
                <DSBodyText className="text-sm font-medium text-gray-600">{stat.title}</DSBodyText>
                <DSBodyText className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</DSBodyText>
                <DSHelpText className="text-green-600 mt-1">{stat.trend}</DSHelpText>
              </div>
              <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      ))}
    </DSContentGrid>
  );
};

export default DashboardStatsRedesigned;
