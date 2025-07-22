
import React from 'react';
import { Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AIAnalysisStatusCard: React.FC = () => {
  const { user } = useAuth();

  const { data: analysisStats, isLoading } = useQuery({
    queryKey: ['ai-analysis-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total analyses this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: analyses, error } = await supabase
        .from('assessment_analysis')
        .select(`
          id,
          created_at,
          assessments!inner(teacher_id)
        `)
        .eq('assessments.teacher_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      if (error) throw error;

      // Get pending analyses (assessments without analysis)
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .eq('teacher_id', user.id);

      const { data: existingAnalyses } = await supabase
        .from('assessment_analysis')
        .select('assessment_id')
        .in('assessment_id', assessments?.map(a => a.id) || []);

      const pendingCount = (assessments?.length || 0) - (existingAnalyses?.length || 0);

      return {
        totalThisWeek: analyses?.length || 0,
        pendingAnalyses: Math.max(0, pendingCount),
        averagePerDay: analyses ? Math.round((analyses.length / 7) * 10) / 10 : 0
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <DSCard>
        <DSCardContent className="p-6">
          <DSFlexContainer align="center" gap="sm">
            <Clock className="h-4 w-4 animate-spin text-blue-500" />
            <DSBodyText>Loading AI analysis status...</DSBodyText>
          </DSFlexContainer>
        </DSCardContent>
      </DSCard>
    );
  }

  const stats = analysisStats || { totalThisWeek: 0, pendingAnalyses: 0, averagePerDay: 0 };

  return (
    <DSCard>
      <DSCardHeader>
        <DSFlexContainer align="center" gap="sm">
          <Brain className="h-5 w-5 text-purple-600" />
          <DSCardTitle>AI Analysis Status</DSCardTitle>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          <DSFlexContainer justify="between" align="center">
            <DSBodyText className="text-sm">Analyses This Week</DSBodyText>
            <DSFlexContainer align="center" gap="sm">
              <DSBodyText className="font-semibold text-lg">{stats.totalThisWeek}</DSBodyText>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </DSFlexContainer>
          </DSFlexContainer>

          <DSFlexContainer justify="between" align="center">
            <DSBodyText className="text-sm">Pending Analyses</DSBodyText>
            <DSFlexContainer align="center" gap="sm">
              <DSBodyText className="font-semibold text-lg">{stats.pendingAnalyses}</DSBodyText>
              {stats.pendingAnalyses > 0 ? (
                <DSStatusBadge variant="warning" size="sm">Pending</DSStatusBadge>
              ) : (
                <DSStatusBadge variant="success" size="sm">Up to date</DSStatusBadge>
              )}
            </DSFlexContainer>
          </DSFlexContainer>

          <DSFlexContainer justify="between" align="center">
            <DSBodyText className="text-sm">Daily Average</DSBodyText>
            <DSBodyText className="font-semibold text-lg">{stats.averagePerDay}</DSBodyText>
          </DSFlexContainer>

          {stats.pendingAnalyses > 5 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <DSFlexContainer align="center" gap="sm">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <DSBodyText className="text-sm text-yellow-800">
                  You have {stats.pendingAnalyses} assessments waiting for AI analysis.
                </DSBodyText>
              </DSFlexContainer>
            </div>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default AIAnalysisStatusCard;
