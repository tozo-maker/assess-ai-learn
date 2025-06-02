
import React from 'react';
import { Users, FileText, Lightbulb, TrendingUp } from 'lucide-react';
import { 
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSBodyText,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';

interface StatsData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  variant: 'primary' | 'success' | 'warning' | 'danger';
}

interface DashboardStatsProps {
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

const DashboardStats: React.FC<DashboardStatsProps> = ({
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
      icon: <Users className="h-6 w-6" />,
      trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} this month` : "No new students",
      variant: 'primary'
    },
    {
      title: "Assessments",
      value: totalAssessments.toString(),
      icon: <FileText className="h-6 w-6" />,
      trend: recentAssessments > 0 ? `+${recentAssessments} this week` : "No recent assessments",
      variant: 'success'
    },
    {
      title: "AI Insights Generated",
      value: aiInsights.toString(),
      icon: <Lightbulb className="h-6 w-6" />,
      trend: todaysInsights > 0 ? `+${todaysInsights} today` : "No new insights",
      variant: 'warning'
    },
    {
      title: "Avg. Class Performance",
      value: studentMetrics?.averagePerformance || "N/A",
      icon: <TrendingUp className="h-6 w-6" />,
      trend: studentMetrics?.averagePerformance !== "N/A" ? "Based on latest data" : "No data available",
      variant: 'danger'
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          iconColor: designSystem.colors.primary.text,
          valueColor: designSystem.colors.primary.text
        };
      case 'success':
        return {
          iconColor: designSystem.colors.success.text,
          valueColor: designSystem.colors.success.text
        };
      case 'warning':
        return {
          iconColor: designSystem.colors.warning.text,
          valueColor: designSystem.colors.warning.text
        };
      case 'danger':
        return {
          iconColor: designSystem.colors.danger.text,
          valueColor: designSystem.colors.danger.text
        };
      default:
        return {
          iconColor: designSystem.colors.neutral.text,
          valueColor: designSystem.colors.neutral.text
        };
    }
  };

  return (
    <DSContentGrid cols={4}>
      {stats.map((stat, index) => {
        const styles = getVariantStyles(stat.variant);
        return (
          <DSCard key={index} className={`${designSystem.transitions.normal} hover:shadow-md`}>
            <DSCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <DSBodyText className="text-sm font-medium text-gray-600">{stat.title}</DSBodyText>
                  <div className={`text-3xl font-bold ${styles.valueColor} mt-2`}>{stat.value}</div>
                  <DSHelpText className={`mt-1 ${
                    stat.trend.includes('+') ? designSystem.colors.success.text : 'text-gray-500'
                  }`}>
                    {stat.trend}
                  </DSHelpText>
                </div>
                <div className={`h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center ${styles.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
            </DSCardContent>
          </DSCard>
        );
      })}
    </DSContentGrid>
  );
};

export default DashboardStats;
